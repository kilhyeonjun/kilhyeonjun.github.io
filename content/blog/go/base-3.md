---
title: Go 기본 명령어 (3)
date: 2021-09-29 13:20:00
category: go
thumbnail: { thumbnailSrc }
draft: false
---

# 함수

- 반복되는 코드를 묶어서 실행하는 코드 블럭의 단위입니다.
- func 키워드를 사용하여 함수를 정의합니다.
- 파라미터명 뒤에 파라미터의 자료형을 정의 합니다.
- return type은 함수명 뒤에 적습니다.

## 소수 판별 프로그램

- 소수 판별 함수

```javascript
func prime(number int){
	p, err := isPrime(number)
	if err != nil {
		fmt.Println(err)
		os.Exit(0)
	}

	if p {
		fmt.Println(number ,"는(은) 소수입니다!")
	}else {
		fmt.Println(number ,"는(은) 소수가 아닙니다~")
	}
}

func isPrime(n int) (bool, error) {
	if n < 2 {
		return false, fmt.Errorf("%d는(은) 소수가 아닙니다~", n)
	}

	for i := 2; i < n; i++ {
		if n%i == 0 {
			return false,nil
		}
	}
	return true, nil // true 리턴이면 소수, false 소수 X
}
```

- 구간별 소수 판별 함수

```javascript
func primeRange(a int, b int){
	if a>b {
		temp := a
		a =b
		b =temp
	}
	for i := a; i<=b; i++{
		p, err := isPrime(i)
		if err != nil {
			fmt.Println(err)
			os.Exit(0)
		}
		if p{
			fmt.Print(i, " ")
		}else {
			fmt.Println( "는(은) 소수가 아닙니다~")
		}
	}
}
```

- main 함수

```javascript
func main() {
	var menu int;

	for true{
		fmt.Print("MENU : 1) 소수판정 2) 구간 소수판정 : ")
		_, err := fmt.Scanln(&menu)

		if  err != nil{
			log.Fatal(err)
		}

		switch menu{
			case 1:
				var in int;
				fmt.Print("정수입력 : ")
				_, err := fmt.Scanln(&in)

				if  err != nil{
					log.Fatal(err)
				}
				prime(in)
			case 2:
				var n1, n2 int;
				fmt.Print("정수 2개 입력 : ")
				_, err := fmt.Scanln(&n1, &n2)

				if err != nil{
					log.Fatal(err)
				}
				primeRange(n1, n2)
			default:
				fmt.Print("프로그램을 종료합니다")
				os.Exit(0)
		}

	}
}
```
