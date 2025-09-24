Instructions:

### plugin_cpp_typescript
1) `git clone` the necessary project: **plugin_cpp_typescript** https://github.com/balancy-liveops/plugin_cpp_typescript
2) then `npm install --no-save`
3) then `npm run build:wasm`
4) copy your full url from the root to this directory: `[your url from root]/plugin_cpp_typescript/packages/wasm`
5) return to this project **demo_typescript** 

### demo_typescript
1) `cd dashboard-app`
2) `npm install --no-save`
3) `npm install --no-save [your url from root]/plugin_cpp_typescript/packages/wasm`
4) `npm run start`
5) open browser page: http://localhost:3030/
