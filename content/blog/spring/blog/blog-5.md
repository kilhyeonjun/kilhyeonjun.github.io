---
title: springboot 블로그 5.HTTP1.1 체험하기
date: 2021-09-17 00:15:00
category: spring
draft: false
---

해당 게시물은 이 [강의](https://edu.goorm.io/lecture/24605/스프링부트-나만의-블로그-만들기)를 보고 제작하게되었습니다.

# ※ HTTP1.1 체험하기

## 1. POSTMAN 설치

- [링크](https://www.postman.com/downloads/)

## 2. HTTP1.1

- get
  - 데이터 검색 select
- post
  - 데이터 추가 insert
- delete
  - 데이터 삭제 delete
- put
  - 데이터 수정 update

## 3. stateless 와 stateful

### stateless 란?

- 요청시 마다 stream을 연결해서 Data를 주고 받는 방식
- 서버 입장에서 부담이 적다.
- Http 에서 사용

### stateful 란?

- 연결이 지속되어있는 방식
- 서버 입장에서 부담이 크다.

## 4. MIME 타입

- [링크](https://developer.mozilla.org/ko/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types)
- 클라이언트가 서버로 데이터를 보낼 때 데이터의 MINE 타입을 전송해야함
- header에는 데이터 양식에 대한 정보(MINE 타입)
- body에는 데이터
