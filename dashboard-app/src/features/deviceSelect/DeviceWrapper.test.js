import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { Balancy } from '@balancy/core';
import DeviceWrapper from './DeviceWrapper';
import { DeviceSelectProvider, useDeviceSelectContext } from './context';
import { IAPEventEmitter, IAPEvents } from '../simulateIAP';

jest.mock('@balancy/core', () => ({ Balancy: { API: { prepareWebView: jest.fn() } } }));

const PHONE = 'iphone-16-pro-max';
const OTHER_PHONE = 'android-medium';

beforeAll(() => {
  global.IS_REACT_ACT_ENVIRONMENT = true;
  global.ResizeObserver = class { observe() {} disconnect() {} };
});

beforeEach(() => {
  localStorage.clear();
  Balancy.API.prepareWebView.mockReset();
});

function renderWrapper(deviceId) {
  localStorage.setItem('balancy-selected-device-id', deviceId);
  let setDevice;
  function Exposer() {
    setDevice = useDeviceSelectContext().setSelectedDeviceId;
    return null;
  }
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => root.render(
    <DeviceSelectProvider><Exposer /><DeviceWrapper><div id="panel" /></DeviceWrapper></DeviceSelectProvider>
  ));
  const wrapper = () => document.getElementById('device-wrapper');
  return {
    wrapper,
    screen: () => wrapper().parentElement,
    switchTo: id => act(() => setDevice(id)),
    // What the SDK does with the persistent WebView shell.
    attachShell: () => wrapper().appendChild(document.createElement('iframe')),
    // The shell is position: fixed; any transformed ancestor becomes its box instead of the panel.
    transformed: () => {
      const found = [];
      for (let el = wrapper(); el && el !== container; el = el.parentElement)
        if (el.style.transform) found.push(el.style.transform);
      return found;
    },
    cleanup: () => { act(() => root.unmount()); container.remove(); },
  };
}

test('warms up the persistent WebView only once #device-wrapper exists', () => {
  let wrapperAtWarmUp;
  Balancy.API.prepareWebView.mockImplementation(() => { wrapperAtWarmUp = document.getElementById('device-wrapper'); });
  const ui = renderWrapper(PHONE);
  try {
    expect(Balancy.API.prepareWebView).toHaveBeenCalled();
    expect(wrapperAtWarmUp).toBe(ui.wrapper());
  } finally { ui.cleanup(); }
});

test.each([
  ['a phone', PHONE, ['none', PHONE, OTHER_PHONE, 'none']],
  ['no device', 'none', [PHONE, 'none', OTHER_PHONE]],
])('switching devices from %s keeps #device-wrapper and the WebView in it', (_, start, switches) => {
  const ui = renderWrapper(start);
  try {
    const wrapper = ui.wrapper();
    const shell = ui.attachShell();
    for (const id of switches) {
      ui.switchTo(id);
      expect(ui.wrapper()).toBe(wrapper);
      expect(shell.isConnected).toBe(true);
      expect(shell.parentElement).toBe(wrapper);
    }
  } finally { ui.cleanup(); }
});

test('without a device the screen fills the panel with no transform, even after a phone', () => {
  const ui = renderWrapper(PHONE);
  try {
    expect(ui.transformed()).not.toEqual([]); // phones are scaled to fit
    ui.switchTo('none');
    expect(ui.transformed()).toEqual([]);
    expect(ui.screen().style.width).toBe('100%');
    expect(ui.screen().style.height).toBe('100%');
  } finally { ui.cleanup(); }
});

test.each([['a phone', PHONE], ['no device', 'none']])('the IAP payment sheet stacks above the WebView layer with %s', (_, deviceId) => {
  const ui = renderWrapper(deviceId);
  try {
    act(() => { IAPEventEmitter.emit(IAPEvents.IAP_OPENED, 'Royal Pass', '$4.99'); });
    const wrapper = ui.wrapper();
    const sheet = ui.screen().lastElementChild;
    expect(sheet).not.toBe(wrapper);
    expect(sheet.textContent).toContain('Royal Pass');
    // Same stacking context, and #device-wrapper is its own layer: nothing the SDK puts inside
    // it, whatever its z-index, can rise above the sheet.
    expect(sheet.parentElement).toBe(wrapper.parentElement);
    expect(getComputedStyle(wrapper).position).toBe('absolute');
    expect(Number(wrapper.style.zIndex)).toBeGreaterThan(0);
    expect(Number(sheet.style.zIndex)).toBeGreaterThan(Number(wrapper.style.zIndex));
  } finally { ui.cleanup(); }
});
