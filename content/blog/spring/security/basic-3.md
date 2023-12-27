---
title: springboot security 3. 스프링부트 시큐리티 시큐리티 회원가입
date: 2021-11-07 17:51:00
category: spring
draft: false
---

해당 게시물은 이 [강의](https://edu.goorm.io/lecture/24606/스프링부트-시큐리티-특강)를 보고 제작하게되었습니다.

# 시큐리티 회원가입

## 회원가입 페이지

- joinForm.html

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>회원가입 페이지</title>
  </head>
  <body>
    <h1>회원가입 페이지</h1>
    <hr />
    <form action="/join" method="post">
      <input type="text" name="username" placeholder="Username" /> <br />
      <input type="password" name="password" placeholder="Password" /> <br />
      <input type="email" name="email" placeholder="Password" /> <br />
      <button>회원가입</button>
    </form>
  </body>
</html>
```

## BCryptPasswordEncoder Bean 등록

- SecurityConfig.java

```java
// 해당 메소드의 리턴되는 오브젝트를 IoC로 등록해준다.
@Bean
public BCryptPasswordEncoder encodePwd() {
    return new BCryptPasswordEncoder();
}
```

## User Entity 생성

- com.kbox.security1.model 패키지 생성

```java
package com.kbox.security1.model;

import java.sql.Timestamp;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

import org.hibernate.annotations.CreationTimestamp;

import lombok.Data;

@Entity
@Data
public class User {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private int id;
	private String username;
	private String password;
	private String email;
	private String role; // ROLE_USER, ROLE_ADMIN
	@CreationTimestamp
	private Timestamp createDate;
}
```

## User JpaRepository 생성

- com.kbox.security1.repository 패키지 생성

```java
package com.kbox.security1.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.kbox.security1.model.User;

// CRUD 함수를 JpaRepository가 들고 있음
// @Repository라는 어노테이션이 없어도 IoC가 됨. JpaRepository를 상속 했기 때문
public interface UserRepository extends JpaRepository<User, Integer>{

}
```

## IndexController 수정 및 회원가입 구현

```java
package com.kbox.security1.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.kbox.security1.model.User;
import com.kbox.security1.repository.UserRepository;

@Controller // View를 리턴하겠다
public class IndexController {

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private BCryptPasswordEncoder bCryptPasswordEncoder;

	// localhost:8080/
	// localhost:8080
	@GetMapping({"","/"})
	public String index() {
		// 머스태치 기본폴더 src/main/resources/
		// viewReslover 설정 : templates (prefix), .mustach(suffix) 생략 가능
		return "index"; // src/main/resources/templates/index.mustach
	}

	@GetMapping("/user")
	public @ResponseBody String user() {
		return "user";
	}

	@GetMapping("/admin")
	public @ResponseBody String admin() {
		return "admin";
	}

	@GetMapping("/manager")
	public@ResponseBody String manager() {
		return "manager";
	}

	// 스프링시큐리티 해당주소를 낚아챔 - SecurityConfig 파일 생성 후 작동안함.
	@GetMapping("/loginForm")
	public String loginForm() {
		return "loginForm";
	}

	@GetMapping("/joinForm")
	public String joinForm() {
		return "joinForm";
	}

	@PostMapping("/join")
	public String join(User user) {
		user.setRole("ROLE_USER");
		String rawPassword = user.getPassword();
		String encPassword = bCryptPasswordEncoder.encode(rawPassword);
		user.setPassword(encPassword);
		userRepository.save(user); // 회원가입 잘됨. 비밀번호 : 1234 => 시큐리티로 로그인을 할 수 없음. 패스워드가 암호화가 안되었기 때문
		return "redirect:/loginForm";
	}

	@GetMapping("/joinProc")
	public @ResponseBody String joinProc() {
		return "회원가입 완료 됨";
	}

}
```
