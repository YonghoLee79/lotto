# 3D 로또 예측 플랫폼을 GitHub에 업로드하는 방법

## 1. GitHub에서 새 저장소 생성
1. GitHub.com에 로그인
2. "New repository" 또는 "+" → "New repository" 클릭
3. Repository name: `3d-lotto-prediction-platform` (또는 원하는 이름)
4. Description: `🎲 3D Three.js 기반 과학적 로또 예측 플랫폼`
5. Public 또는 Private 선택
6. **"Add README file" 체크 해제** (이미 README.md가 있음)
7. "Create repository" 클릭

## 2. 로컬에서 GitHub로 푸시
생성된 저장소 페이지에서 제공되는 URL을 사용하여 다음 명령어들을 실행:

```bash
cd /Users/yongholee/Documents/lotto

# GitHub 저장소를 원격 저장소로 추가 (YOUR_USERNAME과 REPO_NAME을 실제 값으로 변경)
git remote add origin https://github.com/YOUR_USERNAME/3d-lotto-prediction-platform.git

# 메인 브랜치를 GitHub에 푸시
git branch -M main
git push -u origin main
```

## 3. 저장소 설정 확인
```bash
# 원격 저장소 확인
git remote -v

# 푸시 상태 확인
git status
```

## 예제 명령어들
실제 GitHub 사용자명이 'yongholee123'이라면:

```bash
git remote add origin https://github.com/yongholee123/3d-lotto-prediction-platform.git
git branch -M main
git push -u origin main
```

## 추가 파일 업데이트가 필요한 경우
```bash
git add .
git commit -m "🎵 사운드 시스템 개선 및 추가 기능"
git push origin main
```

이미 첫 번째 커밋이 완료되었으므로, GitHub에서 저장소를 생성한 후 위의 git remote add 및 git push 명령어만 실행하면 됩니다.
