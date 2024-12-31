# Language Tracker

## Running Locally

### Setting up redis
[Installation Information](https://redis.io/docs/latest/operate/oss_and_stack/install/install-redis/)

---

### Setting up the backend
`$ cd path/to/backend` 

#### Setting up environment variables:
```sh
$ vim app/.env
```

```env
TRANSLATION_API_KEY=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
TRANSLATION_API_URL=https://api-free.deepl.com/v2/translate
SECRET_KEY=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
ALGORITHM=HS256
```

[DeepL API Key Information](https://developers.deepl.com/docs)

```sh
$ python3 -c "import secrets; print(secrets.token_hex(32))" # run this to generate the SECRET_KEY
```

#### Install Python packages:
`$ pip install -r requirements.txt`

#### Run database migrations:
`$ alembic upgrade head`

#### Populate database:
`$ python app/load_data.py`

#### Run backend:
```sh
$ cd ..
$ uvicorn backend.app.main:app --reload
```

---

### Setting up the frontend
`$ cd path/to/frontend`

#### Install node modules:
`$ npm install`

#### Run frontend:
`$ npm run dev -- --port=3000`
