import fs from 'fs';
import { execSync } from 'child_process';

try {
  // 현재 설치된 패키지 목록
  const installed = execSync('npm list --depth=0 --json').toString();
  const data = JSON.parse(installed).dependencies;

  // 기존 기록 파일 (없으면 생성)
  const recordFile = './package-record.json';
  const existing = fs.existsSync(recordFile)
    ? JSON.parse(fs.readFileSync(recordFile, 'utf-8'))
    : {};

  // 변경사항 비교
  const newPkgs = [];
  for (const [pkg, info] of Object.entries(data)) {
    if (!existing[pkg] || existing[pkg].version !== info.version) {
      newPkgs.push(`${pkg}@${info.version}`);
    }
  }

  if (newPkgs.length) {
    fs.writeFileSync(recordFile, JSON.stringify(data, null, 2));
    console.log(`✅ ${newPkgs.length}개 패키지 변경됨:`);
    newPkgs.forEach(p => console.log(' +', p));
  } else {
    console.log('🔸 새로 추가되거나 변경된 패키지 없음.');
  }
} catch (err) {
  console.error('❌ 오류 발생:', err.message);
}