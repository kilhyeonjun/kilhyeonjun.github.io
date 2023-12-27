---
title: hadoop 환경 설치 (2)
date: 2021-09-29 10:40:00
category: hadoop
draft: false
---

본 게시물은 윈도우 환경에서 진행하였습니다.

# JAVA 설치

- 우분투 터미널 실행

```bash
sudo apt-get update // 모듈 업데이트
java -version // 자바 버전확인 (깔려있는지 확인하기 위함)
sudo apt-get install default-jdk -y // jdk 설차
which java // java 파일 경로 확인
readlink -f /usr/bin/java // readlink : 심볼릭 링크의 원보 파일 확인
//readlink -f : 심볼릭 링크를 따라 최종 파일의 절대경로로 반환

sudo vim /etc/profile
// 파일 맨 밑에
// export JAVA_HOME=/usr/lib/jvm/java-11-openjdk-amd64
// 입력 ( readlink -f 에서 확인한 경로 입력)

source /etc/profile // 스크립트 수정값 적용
```

# 하둡 설치

```bash
wget http://apache.mirror.cdnetworks.com/hadoop/common/hadoop-2.9.2/hadoop-2.9.2.tar.gz
// 파일 다운

tar zxvf hadoop-2.9.2.tar.gz
// 압축 해제

sudo cp -rf hadoop-2.9.2 /usr/local/hadoop
// 압축 해제 폴더 복사

rm -rf hadoop-2.9.2*
// 기존 압축 해제 폴더 제거
```

# 하둡 사용자 등록 및 하둡 소유권 변경

```bash
sudo addgroup hadoop
// hadoop 그룹 추가

sudo adduser --ingroup hadoop manager
// hadoop 그룹에 manager 사용자 추가

sudo adduser manager sudo
// manager 사용자를 sudo 그룹에 추가

sudo chown -R manager:hadoop /usr/local/hadoop
// hadoop 폴더 소유권 변경

ls -l /usr/local
// 변경 됬는지 확인
```

# 하둡 환경 설정

```bash
sudo su - manager // user 변경
nano ~/.bashrc
// 파일 맨 밑에
// export HADOOP_HOME=/usr/local/hadoop
// export PATH=$PATH:$HADOOP_HOME/bin
// export PATH=$PATH:$HADOOP_HOME/sbin
// export HADOOP_MAPRED_HOME=$HADOOP_HOME
// export HADOOP_COMMON_HOME=$HADOOP_HOME
// export HADOOP_HDFS_HOME=$HADOOP_HOME
// 입력

source ~/.bashrc
sudo nano /usr/local/hadoop/etc/hadoop/hadoop-env.sh
// 파일 맨 밑에
// export JAVA_HOME=/usr/lib/jvm/java-11-openjdk-amd64
// 입력
```

# 하둡 구성 설정

## core-site 설정

```bash
sudo mkdir -p /usr/local/hadoop/tmp
sudo chown -R manager:hadoop /usr/local/hadoop/tmp/
sudo nano /usr/local/hadoop/etc/hadoop/core-site.xml
```

- core-site.xml 파일 수정

```xml
<configuration>
    <property>
        <name>hadoop.tmp.dir</name>
        <value>/usr/local/hadoop/tmp</value>
    </property>
    <property>
        <name>fs.default.name</name>
        <value>hdfs://localhost:62350</value>
    </property>
</configuration>
```

- “localhost:62350”은 분산 컴퓨팅을 구현 시 master의 IP와 Port가 된다.

## mapred-site 설정

```bash
cp /usr/local/hadoop/etc/hadoop/mapred-site.xml.template /usr/local/hadoop/etc/hadoop/mapredsite.xml
sudo nano /usr/local/hadoop/etc/hadoop/mapred-site.xml
```

```xml
<configuration>
    <property>
        <name>mapred.job.tracker</name>
        <value>localhost:62351</value>
    </property>
</configuration>
```

## hdfs-site 설정

```bash
sudo mkdir -p /usr/local/hadoop/hdfs/namenode
sudo mkdir -p /usr/local/hadoop/hdfs/datanode
sudo chown -R manager:hadoop /usr/local/hadoop/hdfs
sudo nano /usr/local/hadoop/etc/hadoop/hdfs-site.xml
```

```xml
<configuration>
    <property>
        <name>dfs.replication</name>
        <value>1</value>
    </property>
    <property>
        <name>dfs.namenode.name.dir</name>
        <value>file:/usr/local/hadoop/hdfs/namenode</value>
    </property>
    <property>
        <name>dfs.datanode.data.dir</name>
        <value>file:/usr/local/hadoop/hdfs/datanode</value>
    </property>
</configuration>
```

- dfs.replication value가 1이면 싱글 모드 3은 분산 모드

## 인증키 생성

```bash
ssh-keygen -t rsa
ssh-copy-id -i .ssh/id_rsa.pub manager@localhost
```

# 하둡 실행

- manager 사용자 사용 (sudo su - manager)

```bash
hadoop namenode -format
start-dfs.sh
jps
// java 실행중인 프로세스 확인
// SecondaryNameNode, DataNode, Jps, NameNode
```

# WordCount 예제 테스트

```bash
hadoop fs -mkdir -p /wordcount/input
hadoop fs -put CHANGES.txt /wordcount/input
hadoop jar WordCount.jar com.care.WordCount.WordCount /wordcount/input /wordcount/output
hadoop fs -ls /wordcount/output/
hadoop fs -cat /wordcount/output/part-00000
```
