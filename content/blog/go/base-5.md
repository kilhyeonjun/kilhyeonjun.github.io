---
title: Go 기본 명령어 (5)
date: 2021-10-05 21:45:00
category: go
thumbnail: { thumbnailSrc }
draft: false
---

# 포인터

- 변수의 메모리 주소를 값으로 가지는 변수

## 포인터 생성

```javascript
var a int = 10
var pa *int
pa = &a
```

- 자료형앞에 \*(애스터리스크) 문자를 붙여 포인터 선언
- &문자는 변수의 메모리 주소를 반환
- 10을 가지는 정수형 a의 주소값을 정수형 포인터 pa에 메모리 주소 할당

## 역참조

```javascript
*pa = 20
```

- 포인터가 가르키는 값을 가져옴
- \*(애스터리스크) 문자를 통해 역참조를 하게됨
- pa가 가르키는 a의 값을 역참조하여 20을 대입
- a 값은 20으로 변경

## 포인터 swap 함수

```javascript
// pass by pointer (call by pointer)
func swap(n1 *int, n2 *int) {
	temp := *n1
	*n1 = *n2
	*n2 = temp
}
```

- 파라미터로 두개의 포인터를 받음
- 각 포인터가 가르키는 값을 역참조를 통해 변경
- return 필요없이 포인터를 활용하여 해당값 변경 가능
