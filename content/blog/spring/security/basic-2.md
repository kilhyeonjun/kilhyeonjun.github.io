---
title: springboot security 2. 스프링부트 시큐리티 시큐리티 설정
date: 2021-11-07 16:51:00
category: spring
thumbnail: { thumbnailSrc }
draft: false
---

해당 게시물은 이 [강의](https://edu.goorm.io/lecture/24606/스프링부트-시큐리티-특강)를 보고 제작하게되었습니다.

# 시큐리티 설정

## SecurityConfig 생성

```java
package com.kbox.security1.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;

@Configuration
@EnableWebSecurity // 스프링 시큐리티 필터가 스프링 필터체인에 등록이 됩니다.
public class SecurityConfig extends WebSecurityConfigurerAdapter{

	@Override
	protected void configure(HttpSecurity http) throws Exception {
		http.csrf().disable();
		http.authorizeRequests()
			.antMatchers("/user/**").authenticated()
			.antMatchers("/manager/**").access("hasRole('ROLE_ADMIN') or hasRole('ROLE_MANAGER')")
			.antMatchers("/admin/**").access("hasRole('ROLE_ADMIN')")
			.anyRequest().permitAll()
			.and()
			.formLogin()
			.loginPage("/login");

	}
}
```

## IndexController 수정

```java
package com.kbox.security1.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller // View를 리턴하겠다
public class IndexController {

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
	@GetMapping("/login")
	public @ResponseBody String login() {
		return "login";
	}

	@GetMapping("/join")
	public @ResponseBody String join() {
		return "join";
	}

	@GetMapping("/joinProc")
	public @ResponseBody String joinProc() {
		return "회원가입 완료 됨";
	}

}
```
