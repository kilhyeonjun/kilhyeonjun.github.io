---
title: Git 기본 명령어
date: 2021-09-12 00:40:00
category: git
draft: false
---

### Git 이란?

- 분산 버전 관리 시스템

### GitHub 이란?

- git으로 관리하는 프로젝트를 올려 둘 수 있는 사이트

### local repository 이란?

- git init 명령어로 생성되는 디렉토리(폴더)
- commit, commit을 구성하는 객체, 스테이지가 저장됨

### remote repository 이란?

- 로컬 저장소를 upload하는 곳 ex) GitHub

### working tree 이란?

- 워크트리, 워킹 디렉토리, 작업 디렉토리, 작업 폴더

### Git 저장소

- 정확하게는 로컬 저장소
- 넓은 의미로는 작업 폴더

### init

```
git init
```

로컬 repository를 생성하는 명령어입니다.

### status

```
git status
```

로컬 repository의 파일들의 상태를 보여줍니다.

### add

```
git add [파일명]
```

작업 디렉토리 상의 변경 내용을 stage에 추가하는 명령어입니다.

### commit

```
git commit -m "내용"
```

stage 사항을 기록합니다.

### config

```
git config --global user.name "이름"
git config --global user.email "이메일주소"
```

git 유저의 이름과 email을 설정해줍니다.

### checkout

```
git checkout [해쉬값]    (1)
git checkout -          (2)
```

(1) 로컬 repository를 해당 해쉬를 가진 commit의 repository로 변경합니다  
(2) 로컬 repository를 이전 repository로 변경합니다.  
해쉬값은 앞 7자리만 써도 됩니다.

### log

```
git log
```

commit된 내용들을 보여줍니다.

### remote

```
git remote add [원격 저장소 별칭] [원격 repository URL]
ex) git remote add origin https://github.com/kilhyeonjun/study.git
```

로컬 repository를 원격 repository 에 연결해줍니다.

### push

```
git push [원격 저장소 별칭] [브랜치 이름]
ex) git push origin master
```

commit 된 내용을 원격 repository로 보냅니다.

### clone

```
git clone [원격 repository URL]
ex) git clone https://github.com/kilhyeonjun/study.git
```

원격 repository를 복사해옵니다.

### pull

```
git pull [원격 저장소 별칭] [브랜치 이름]
ex) git pull origin master
```

원격 repository를 복사해옵니다
