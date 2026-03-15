import { build } from 'vite';
import * as esbuild from 'esbuild';

async function buildElectron() {
  // 1. Build do Vite (React App)
  await build();
  console.log('✅ Vite Frontend web-build concluido!');

  // 2. Build do Electron Script (Node)
  await esbuild.build({
    entryPoints: ['electron/main.ts'],
    bundle: true,
    platform: 'node',
    target: 'node18',
    outfile: 'dist-electron/main.js',
    external: ['electron', 'electron-is-dev'], // Evitar empacotar natives e node modules problematicos
  });
  console.log('✅ Script Electron Buildado!');
  
  // Daqui pra frente o usuário chamaria: "npx electron-builder --mac" para gear o .dmg.
}

buildElectron().catch(console.error);
