---
title: Go 기본 명령어 (8)
date: 2021-10-26 21:55:00
category: go
thumbnail: { thumbnailSrc }
draft: false
---

# struct 구조체

## 구조체 정의

```javascript
// 구조체 정의
type Student struct {
    Name  string
 	Id    int
 	Score float64
 	Class string
}
```

## 선언 및 속성값 할당

```javascript
// 1)
var s1 Student
s1.Name = "홍길동"
s1.Id = 12345678
s1.Class = "A"
s1.Score = 3.91

// 2)
var s1 Student = Student{"홍길동", 12345678, 3.91, "A"}

// 3)
var s1 Student = Student{
	"홍길동",
	12345678,
	3.91,
	"A",
}

// 4)
var s2 Student = Student{
	Id:    12341234,
	Class: "B",
}
```

## 선언과 동시에 구조체 정의

```javascript
var s1 struct {
	Name  string
	Id    int
	Score float64
	Class string
}
s1.Name = "홍길동"
s1.Id = 12345678
s1.Class = "A"
s1.Score = 3.91
```

## pass by value

```javascript
func defaultStudent(id int) Student {
 	var s Student
 	s.Id = id
 	s.Name = "noname"
 	s.Class = "001"
 	s.Score = 0.0
 	return s
}
var s3 Student
defaultStudent(&s3)
```

## pass by pointer

```javascript
func defaultStudent(s *Student) {
 	s.Id = 11112222
 	s.Name = "noname"
 	s.Class = "001"
    s.Score = 0.0
}
var s3 Student
defaultStudent(&s3)
```

## 정렬 인터페이스

```javascript
type Interface interface {
	Len() int           // 데이터의 길이를 구함
	Less(i, j int) bool // 대소관계를 판단. i가 작으면 true를 리턴하도록 구현
	Swap(i, j int)      // Less 메서드에서 true가 나오면 두 데이터의 위치를 바꿈
}
```

```javascript
type Student struct {
	Name  string
	Id    int
	Score float64
	Class string
}

type Students []Student

// 데이터의 길이를 구함. 슬라이스이므로 len 함수를 사용
func (s Students) Len() int           { return len(s) }
// 학생 이름순으로 정렬
func (s Students) Less(i, j int) bool { return s[i].Score < s[j].Score }
// 두 데이터의 위치를 바꿈
func (s Students) Swap(i, j int)      { s[i], s[j] = s[j], s[i] }

s := []Student{
	{"홍길동", 12345678, 3.91, "A"},
	{Name: "최길동", Id: 12341234, Class: "B", Score: 3.76},
	{"박길동", 11112222, 4.01, "C"},
}

sort.Sort(Students(s))
```

- 구조체 슬라이스를 정렬하기 위해선 sort.Interface를 구현해야함.
- sort.Interface는 Len, Less, Swap 메서드를 구현해야함.
