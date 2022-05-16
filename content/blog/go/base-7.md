---
title: Go 기본 명령어 (7)
date: 2021-10-05 21:55:01
category: go
thumbnail: { thumbnailSrc }
draft: false
---

# slice 슬라이스

- 특정한 길이의 요소들로 이루어진 순서열
- 크기가 고정되어있지 않다.
- 슬라이스를 복사 할 경우 메모리 주소를 복사한다.

## slice 선언

```javascript
// ex1)
var s []int
s = make([]int, 5)

// ex2)
s := make([]int, 5)

// ex3)
var s []int = []int{0, 0, 0, 0, 0}

// ex4)
s := []int{0, 0, 0, 0, 0}
```

- slice는 선언시 크기를 할당하지 않는다. (make시 할당 하지만 가변 크기)

## slice append

```javascript
s = append(s, -9, 10, 2, ...)
```

# re-slice

```javascript
a := []string{"a", "b", "c", "d"}
as := a[0:2]
```

- 다시 슬라이스 한다.
- a와 as는 메모리 영역이 같다.

```javascript
s1 := []int{1, 2, 3}
s2 := append([]int{}, s1...)
```

- s1과 s2는 메모리 영역이 다르다.
- value만 복사

# value copy

```javascript
s1 := []int{1, 2, 3}
s2 := append([]int{}, s1...)
```
