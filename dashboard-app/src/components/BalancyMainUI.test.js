import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { BalancyMainUI } from './BalancyMainUI';
import { Callbacks, SmartObjectsViewPlacement } from '@balancy/core';

jest.mock('@balancy/core', () => {
  class Callback {
    listeners = new Map();
    serial = 0;
    subscribe(fn) { const id = ++this.serial; this.listeners.set(id, fn); return id; }
    unsubscribe(id) { this.listeners.delete(id); }
    notify(value) { for (const fn of this.listeners.values()) fn(value); }
  }
  const names = ['onNewEventActivated', 'onEventDeactivated', 'onEventRemoved',
    'onNewOfferActivated', 'onOfferDeactivated', 'onNewOfferGroupActivated',
    'onOfferGroupDeactivated', 'onDataUpdated', 'onProfileResetStart'];
  return {
    Balancy: { Main: { isReadyToUse: false } },
    Callbacks: Object.fromEntries(names.map(name => [name, new Callback()])),
    SmartObjectsViewPlacement: { MainLeft: 1, MainRight: 2 },
  };
});

test('Finished stays openable until Removed; a later occurrence keeps its icon', () => {
  global.IS_REACT_ACT_ENVIRONMENT = true;
  jest.useFakeTimers();
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  const openView = jest.fn();
  const model = { unnyId: 'same-event', unnyPlacement: SmartObjectsViewPlacement.MainLeft,
    unnyPriority: 1, icon: null, unnyView: { openView } };
  const first = { instanceId: 'first', gameEvent: model, isFinished: false,
    getSecondsLeftBeforeDeactivation: () => 60 };
  const next = { ...first, instanceId: 'next' };
  const icons = () => container.querySelectorAll('.balancy-element');
  try {
    act(() => root.render(<BalancyMainUI />));
    act(() => Callbacks.onNewEventActivated.notify(first));
    expect(icons()).toHaveLength(1);
    act(() => {
      first.isFinished = true;
      Callbacks.onEventDeactivated.notify(first);
      jest.advanceTimersByTime(1000);
    });
    expect(icons()).toHaveLength(1);
    expect(icons()[0].textContent).toContain('FINISHED');
    act(() => icons()[0].dispatchEvent(new MouseEvent('click', { bubbles: true })));
    expect(openView).toHaveBeenCalledWith(expect.any(Function), first);
    act(() => Callbacks.onNewEventActivated.notify(next));
    expect(icons()).toHaveLength(2);
    act(() => Callbacks.onEventRemoved.notify(first));
    expect(icons()).toHaveLength(1);
    expect(icons()[0].textContent).not.toContain('FINISHED');
    act(() => Callbacks.onEventRemoved.notify(first));
    expect(icons()).toHaveLength(1);
    act(() => Callbacks.onEventRemoved.notify(next));
    expect(icons()).toHaveLength(0);
  } finally {
    act(() => root.unmount());
    container.remove();
    jest.useRealTimers();
    delete global.IS_REACT_ACT_ENVIRONMENT;
  }
  for (const callback of Object.values(Callbacks)) expect(callback.listeners.size).toBe(0);
});
