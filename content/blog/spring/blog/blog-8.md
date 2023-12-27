---
title: springboot 블로그 8.테이블 생성하기
date: 2021-09-17 03:45:00
category: spring
draft: false
---

해당 게시물은 이 [강의](https://edu.goorm.io/lecture/24605/스프링부트-나만의-블로그-만들기)를 보고 제작하게되었습니다.

# 테이블 생성하기

## 1. Blog 테이블 만들기 (User, Board, Reply)

- User.java

```java
package com.kbox.blog.model;

import java.sql.Timestamp;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.CreationTimestamp;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder // 빌더 패턴
@Entity // User 클래스가 Mysql에 테이블이 생성된다 // ORM -> 언어(ex) JAVA)  Object -> 테이블로 매핑해주는 기술
public class User {

		@Id //Primary key
		@GeneratedValue(strategy = GenerationType.IDENTITY) // 프로젝트에서 연결된 DB의 넘버링 전략을 따라간다.
		private int id; // 시퀀스(오라클), auto_increment(mysql)

		@Column(nullable =false, length = 30)
		private String username; //아이디

		@Column(nullable =false, length = 100) // 해쉬 (비밀번호 암호화)
		private String password;

		@Column(nullable =false, length = 50)
		private String email;

		@ColumnDefault("'user'")
		private String role;  // Enum을 쓰는게 좋다. // admin, user, manager

		@CreationTimestamp // 시간이 자동 입력
		private Timestamp createDate;
}
```

- Board.java

```java
package com.kbox.blog.model;

import java.sql.Timestamp;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.Lob;
import javax.persistence.ManyToOne;

import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.CreationTimestamp;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
public class Board {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY) //auto_increment
	private int id;

	@Column(nullable = false, length = 100)
	private String title;

	@Lob // 대용량 데이터
	private String content; // 섬머노트 라이브러리 사용 예정, html태그가 섞여서 디자인 됨.

	@ColumnDefault("0")
	private int count; //조회수

	@ManyToOne  // Many = Board, User = one
	@JoinColumn(name="userId")
	private User user; // DB는 오브젝트를 저장할 수 없다(그래서 FK 사용), but 자바는 오브젝트를 저장할 수 있다.

	@CreationTimestamp
	private Timestamp createDate;
}
```

- Reply.java

```java
package com.kbox.blog.model;

import java.sql.Timestamp;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;

import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.CreationTimestamp;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Data
@Entity
public class Reply {
	@Id //Primary key
	@GeneratedValue(strategy = GenerationType.IDENTITY) // 프로젝트에서 연결된 DB의 넘버링 전략을 따라간다.
	private int id; // 시퀀스(오라클), auto_increment(mysql)

	@Column(nullable = false, length = 200)
	private String content;

	@ManyToOne
	@JoinColumn(name="boardId")
	private Board board;

	@ManyToOne
	@JoinColumn(name="userId")
	private User user;

	@CreationTimestamp
	private Timestamp creatDate;
}
```

## 2. 연관관계 만들기

- @ManyToOne
- @OneToMany
- @OneToOne
- @ManyToMany
- ManyToMany는 사용하지 않는다.
- 그 이유는 서로의 primary key로만 중간 테이블을 생성해주는데, 날짜나 시간 다른 필드들이 필요할 수 있기 때문에, 내가 중간 테이블을 직접만들고 @OneToMany, @OneToMany를 사용한다.

## 3. 더미 데이터 insert

- UserRepository.java

```java
package com.kbox.blog.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.kbox.blog.model.User;

// DAO
// 자동으로 bean등록이 된다.
// @Repository 생략 가능
public interface UserRepository extends JpaRepository<User, Integer>{

}
```

- RoleType.java

```java
package com.kbox.blog.model;

public enum RoleType {
	USER, ADMIN
}
```

- User.java RoleType 수정 및 @DynamicInsert 추가(insert할때 null 인 필드 제외)

```java
@AllArgsConstructor
@Builder // 빌더 패턴
@Entity // User 클래스가 Mysql에 테이블이 생성된다 // ORM -> 언어(ex) JAVA)  Object -> 테이블로 매핑해주는 기술
@DynamicInsert
public class User {
    ...

    @ColumnDefault("'user'")
    private String role;  // Enum을 쓰는게 좋다. // admin, user, manager

    // DB는 RoleType이라는게 없다.
    @Enumerated(EnumType.STRING)
    private RoleType role;  // Enum을 쓰는게 좋다. // admin, user, manager

    ...
}
```

- DummyControllerTest.java

```java
package com.kbox.blog.test;

import java.util.function.Supplier;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kbox.blog.model.RoleType;
import com.kbox.blog.model.User;
import com.kbox.blog.repository.UserRepository;

@RestController
public class DummyControllerTest {

	@Autowired // 의존성 주입(DI)
	private UserRepository userRepository;

	// http://localhost:8000/blog/dummy/join (요청)
	// http의 body에 username, password, email 데이터를 가지고 (요청)
	@PostMapping("/dummy/join")
	public String join(User user) {
		System.out.println("id : " + user.getId());
		System.out.println("username :" + user.getUsername());
		System.out.println("password :" + user.getPassword());
		System.out.println("email :" + user.getEmail());
		System.out.println("createDate :" + user.getCreateDate());

		user.setRole(RoleType.USER);
		userRepository.save(user);
		return "회원가입이 완료되었습니다.";
	}
}
```

## 4. 더미 데이터 select 및 응답

- DummyControllerTest.java

```java
// {id} 주소로 파마레터를 전달 받을 수 있음.
// http://localhost:8000/blog/dummy/user/3
@GetMapping("/dummy/user/{id}")
public User detail(@PathVariable int id) {
    // 없는 값을 찾으면 user의 값이 null 이 됨
    // User user = userRepository.findById(id); //v1
    // Optional로 user 객체를 감싸서 null 유무 판단
    /*
    User user = userRepository.findById(id).orElseGet(new Supplier<User>() {
        @Override
        public User get() {
            // TODO Auto-generated method stub
            return new User();
        }
    });
    //v2
    // 람다식

    User user = userRepository.findById(id).orElseThrow(()->{
        return new IllegalArgumentException("해당 유저는 없습니다. id : " + id);
    });
    */
    User user = userRepository.findById(id).orElseThrow(new Supplier<IllegalArgumentException>() {
        @Override
        public IllegalArgumentException get() {
            // TODO Auto-generated method stub
            return new IllegalArgumentException("해당 유저는 없습니다. id : " + id);
        }
    });
    // 요청 : 웹브라우저
    // user 객체 = 자바 오브젝트
    // 변환 (웹브라우저가 이해할 수 있는 데이터) -> json
    // 기본 스프링 Gson 라이브러리 사용
    // 스프링부트 = MessageConverter라는 애가 응답시에 자동 작동
    // 자바 오브젝트 리턴시 MessageConverter가 자바 오브젝트를 json으로 변환해서 던져줌
    return user;
}
```

```java
// http://localhost:8000/blog/dummy/users
@GetMapping("/dummy/users")
public List<User> list(){
    return userRepository.findAll();
}
```

```java
// http://localhost:8000/blog/dummy/user/page
// http://localhost:8000/blog/dummy/user?page=1
// 한페이지당 2건에 데이터를 리턴받아 볼 예정
@GetMapping("/dummy/user")
public List<User> pageList(@PageableDefault(size = 2, sort = "id", direction = Sort.Direction.DESC) Pageable pageable){
    Page<User> pagingUser = userRepository.findAll(pageable);

    List<User> users = pagingUser.getContent();
    return users;
}
```

## 5. 더미 데이터 update

- DummyControllerTest.java

```java
// save함수는 id를 전달하지 않으면 insert를 해주고
// save함수는 id를 전달하면 해당 id에 대한 데이터가 있으면 update를 해주고
// save함수는 id를 전달하면 해당 id에 대한 데이터가 없으면 insert
// email. password
@Transactional // 함수 종료시 자동 commit
@PutMapping("/dummy/user/{id}")
public User updateUser(@PathVariable int id, @RequestBody User requestUser) { //@RequestBody json 데이터를 Java Object(MessageConverter의 Jackson 라이브러리)로 변환해서 받음
    System.out.println("id : " +id);
    System.out.println("password : " +requestUser.getPassword());
    System.out.println("email : " +requestUser.getEmail());

    User user = userRepository.findById(id).orElseThrow(()->{
        return new IllegalArgumentException("수정에 실패하였습니다.");
    });
    user.setPassword(requestUser.getPassword());
    user.setEmail(requestUser.getEmail());

    // userRepository.save(user);

    // 더티 체킹
    return user;
}
```

## 6. 더미 데이터 delete

- DummyControllerTest.java

```java
@DeleteMapping("/dummy/user/{id}")
public String delete(@PathVariable int id) {
    try {
        userRepository.deleteById(id);
    } catch (EmptyResultDataAccessException e) {
        return "삭제에 실패하였습니다. 해당 id는 DB에 없습니다.";
    }
    return "삭제 되었습니다. id : " + id;
}
```

## 7. 무한 참조 방지하기

1. Entity로 받고 Json직렬화 하기 전에 DTO 생성후 복사하기

- BeanUtils.copyProperties(A,B)

2. 처음부터 DTO로 DB에서 받기
3. @JsonIgnore
4. @JsonIgnoreProperties({"board"})
5. @JsonBackReference @JsonManagedReference
