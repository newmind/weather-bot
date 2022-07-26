## Description

WeatherBot API 는 현재 날씨와 예보 정보를 종합하여, 날씨 요약 문구를 생성해주는 서비스입니다. 

## Prerequisite

- 최신 버전의 nodejs (현재 18.6)
- 최신 버전의 nestjs (현재 9.0)

```bash
$ brew install node
$ npm install -g @nestjs/cli
```

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

```bash
# api 테스트
$ curl 'localhost:3000/summary?lat=-21.3&lon=125' | jq
```

## Test

```bash
# unit tests
$ npm run test
```

