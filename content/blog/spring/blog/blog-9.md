---
title: springboot 블로그 9.Json 데이터로 통신하기
date: 2021-09-27 08:45:00
category: spring
draft: false
---

해당 게시물은 이 [강의](https://edu.goorm.io/lecture/24605/스프링부트-나만의-블로그-만들기)를 보고 제작하게되었습니다.

# Json 데이터로 통신하기

## 1. Get요청

- 주소에 데이터를 담아 보낸다. 데이터 형태는 key=value
- body로 데이터를 담아 보내지 않음.

## 2. Post, Put, Delete 요청 (데이터를 변경)

- Body에 데이터를 담아 보낸다. 데이터 형태는 json으로 통일하는 것이 좋다.
- form 태그는 get, post 요청만 가능 (key=value)
- js로 ajax를 이용하여 요청
- form:form 태그 는 put, delete 등 가능 (사용 X)

## 3. 스프링 컨트롤러의 파싱 전략 1

- 스프링 컨트롤러는 key=value 데이터를 자동으로 파싱하여 변수에 담아준다.
- 가령 get요청은 key=value이고 post요청중에 x-www-form-urlencoded (form태그를 만들어서 데이터 전송) 시에도
- key=value 이기 때문에 이러한 데이터는 아래와 같이 함수의 파라메터로 받을 수 있다.

```java
PostMapping("/home")
public String home(String username, String email){

    return "home";
}
```

## 4. 스프링 컨트롤러의 파싱 전략 2

- 스프링은 key=value 형태의 데이터를 오브젝트로 파싱해서 받아주는 역할도 한다.
- 이때 주의 할점은 setter가 없으면 key=value 데이터를 스프링이 파싱해서 넣어주지 못한다.

```java
class User {
	private String username;
    private String password;

    public String getUsername(){
    	return username;
    }

    public String getPassword(){
    	return password;
    }

    public void setUsername(String username){
    	this.username = username;
    }

    public void setPassword(String password){
    	this.password = password;
    }

}
```

```java
PostMapping("/home")
public String home(User user){

    return "home";
}
```

## 5. key=value가 아닌 데이터는 어떻게 파싱할까?

- json 데이터나 일반 text데이터는 스프링 컨트롤러에서 받기 위해서는 @RequestBody 어노테이션이 필요하다.
- 기본전략이 스프링 컨트롤러는 key=value 데이터를 파싱해서 받아주는 일을 하는데 다른 형태의 데이터 가령 json 같은 데이터는 아래와 같이 생겼다.

```json
{
  "username": "ssar",
  "password": "1234"
}
```

- 이런 데이터는 스프링이 파싱해서 오브젝트로 받지 못한다.
- 그래서 @RequestBody 어노테이션을 붙이면 MessageConverter 클래스를 구현한 Jackson 라이브러리가 발동하면서 json 데이터를 자바 오브젝트로 파싱하여 받아준다.

```json
PostMapping("/home")
public String home(@RequestBody User user){

    return "home";
}
```

## 6. form 태그로 json데이터 요청방법

- join.jsp

```html
<div class="container">
  <form>
    <div class="form-group">
      <label for="username">유저네임</label>
      <input type="text" id="username" />
    </div>
    <div class="form-group">
      <label for="password">패스워드</label>
      <input type="password" id="password" />
    </div>

    <div class="form-group">
      <label for="email">이메일</label>
      <input type="email" id="email" />
    </div>
  </form>

  <button id="join--submit" class="btn btn-primary">회원가입</button>
</div>

<script src="/js/join.js"></script>
```

- join.js

```javascript
<script>
$('#join--submit').on('click', function() {
	var data = {
		username : $('#username').val(),
		password : $('#password').val(),
		email : $('#email').val()
	};

	$.ajax({
		type : 'POST',
		url : '/user/join',
		data : JSON.stringify(data),
		contentType : 'application/json; charset=utf-8',
		dataType : 'json'
	}).done(function(r) {
		if (r.statusCode == 200) {
			console.log(r);
			alert('회원가입 성공');
			location.href = '/user/login';
		} else {
			if (r.msg == '아이디중복') {
				console.log(r);
				alert('아이디가 중복되었습니다.');
			} else {
				console.log(r);
				alert('회원가입 실패');
			}
		}
	}).fail(function(r) {
		var message = JSON.parse(r.responseText);
		console.log((message));
		alert('서버 오류');
	});
});
</script>
```
