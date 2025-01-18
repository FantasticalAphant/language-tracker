# Language Tracker

This web application is a supplementary aid to learning Mandarin Chinese.
It provides a dictionary, HSK word lists, example sentences as resources.
The text analyzer splits up text into words. It also contains a Mandarin Chinese to English text translator.
The application also allows users to create their own word lists.
There is a login function so that user-defined word lists are linked with each user.

The web application is built using FastAPI for the backend and React for the frontend.

### Setting up environment variables:

```sh
$ vim path/to/backend/app/.env
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

### Setting up Redis (if running on own machine)

[Installation Information](https://redis.io/docs/latest/operate/oss_and_stack/install/install-redis/)

---

## Running on Docker

```sh
$ docker-compose up --build # at the root directory
```

---

## Running Locally

### Setting up the backend

`$ cd path/to/backend/app`

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
