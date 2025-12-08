import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const browsers = ['chrome', '360', 'brave', 'edge', 'firefox', 'opera', 'qq', 'sogou'];

// 确保输出目录存在
const outputDir = path.resolve(rootDir, '../tmarks/public/extensions');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log('开始为所有浏览器构建扩展...\n');

for (const browser of browsers) {
  console.log(`\n========== 构建 ${browser.toUpperCase()} 版本 ==========`);
  
  const manifestSrc = path.join(rootDir, 'manifests', `manifest.${browser}.json`);
  const manifestDest = path.join(rootDir, 'manifest.json');
  
  // 复制对应的 manifest 文件
  fs.copyFileSync(manifestSrc, manifestDest);
  console.log(`✓ 已复制 manifest.${browser}.json`);
  
  // 构建
  try {
    execSync('npm run build', { 
      cwd: rootDir, 
      stdio: 'inherit'
    });
    console.log(`✓ ${browser} 构建完成`);
  } catch (error) {
    console.error(`✗ ${browser} 构建失败:`, error.message);
    continue;
  }
  
  // 打包成 zip
  const distDir = path.join(rootDir, 'dist');
  const zipFile = path.join(outputDir, `tmarks-extension-${browser}.zip`);
  
  try {
    // 使用 PowerShell 的 Compress-Archive 命令
    const command = `powershell -Command "Compress-Archive -Path '${distDir}\\*' -DestinationPath '${zipFile}' -Force"`;
    execSync(command, { stdio: 'inherit' });
    console.log(`✓ 已打包到 ${zipFile}`);
  } catch (error) {
    console.error(`✗ ${browser} 打包失败:`, error.message);
  }
}

console.log('\n========== 所有浏览器构建完成 ==========');
console.log(`输出目录: ${outputDir}`);
