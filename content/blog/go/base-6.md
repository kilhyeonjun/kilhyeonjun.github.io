---
title: Go 기본 명령어 (6)
date: 2021-10-05 21:55:00
category: go
thumbnail: { thumbnailSrc }
draft: false
---

# array 배열

- 특정한 길이의 요소들로 이루어진 순서열
- 크기가 고정 되어있다.
- 배열을 복사 할 경우 값 만 복사.

## array 선언

```javascript
// ex1)
var primes [3]int
primes[0] = 2
primes[1] = 3
primes[2] = 5

// ex2)
var primes [3]int = [3]int{2,3,5}

// ex3)
primes := [3]int{2, 3, 5}
```

- 초기화 하지 않은 원소의 제로 값은 해당 원소의 타입의 제로값으로 결정된다.

## array and for

```javascript
// ex1)

for i := 0; i < len(primes); i++ {
 	fmt.Println(primes[i])
}

// ex2)
for index, prime := range primes {
 	fmt.Println(index, prime)
}
```

- range를 이용하여 index, value 를 반환
