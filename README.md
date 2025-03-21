# QR 코드 생성기

이 프로젝트는 Python을 사용하여 QR 코드를 생성하는 간단한 도구입니다.

## 설치 방법

1. 필요한 패키지 설치:
```bash
pip install -r requirements.txt
```

## 사용 방법

1. 기본 사용:
```python
from generate_qr import generate_qr

# QR 코드 생성
generate_qr("https://www.example.com")
```

2. 파일 이름 지정:
```python
generate_qr("https://www.example.com", "my_qr.png")
```

## 매개변수

- `data`: QR 코드에 인코딩할 데이터 (문자열)
- `filename`: 저장할 파일 이름 (기본값: "qr_code.png")
