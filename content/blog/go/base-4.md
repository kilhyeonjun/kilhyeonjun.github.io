---
title: Go 기본 명령어 (4)
date: 2021-09-29 14:00:00
category: go
draft: false
---

# 패키지

- 코드의 모듈화, 코드의 재사용을 위해 사용
- 작은 단위의 컴포넌트를 작성

## Main 패키지

- 보통 패키지는 라이브러리로 사용되지만
- main 패키지는 컴파일러에 의해 실행 프로그램이 된다.

## mymath 패키지 생성

```javascript
package mymath

import "fmt"

func MyAbs(n int) int {
	if n < 0 {
		n = n * -1
	}
	return n
}

func MyPower(base int, exponent int) int {
	result := 1
	for i := 1; i <= exponent; i++ {
		result = result * base
	}
	return result
}

func Test() {
	fmt.Println("내가 만든 수학 패키지!")
}
```

- MyAbs 절대값 함수
- MyPower 거듭제곱 함수

## 패키지 import

```javascript
package main

import (
	"fmt"
	"gowork/packages/mymath"
)

func main(){
	mymath.Test()
	fmt.Println(mymath.MyPower(2,10))
	fmt.Println(mymath.MyPower(3,3))
	fmt.Println("HI")
	fmt.Println(mymath.MyAbs(-99))
}
```

## 실행파일 생성

```
go mod init gowork/packages // 모듈 생성
cd [main파일 디렉토리]
go build // 빌드
```
