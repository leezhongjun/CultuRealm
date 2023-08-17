# CultuRealm

## How to run frontend

1. Install npm
2. run

```
cd frontend
npm install
npm run dev
```

3. Change `.example.env` to `.env` and change the variables to your own

4. Go to [`chrome://flags/#allow-insecure-localhost`](chrome://flags/#allow-insecure-localhost) and enable `Allow invalid certificates for resources loaded from localhost.`

5. Comment out `<React.StrictMode>` from `main.tsx` to prevent double useEffect calls

### Frontend stack:

react ts

tailwind css

## How to run backend

1. Install python3
2. Install pip
3. Install pipenv
4. Change `.example.env` to `.env` and change the variables to your own
5. run

```
cd backend
pip install -r requirements.txt
python main.py
```

### Backend stack:

Flask

SQLAlchemy
