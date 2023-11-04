# CultuRealm

A gamified web app for intercultural learning

Sub-theme winner of [SCS Splash Awards 2023](https://www.scs.org.sg/awards/splash/2023/announcement)

[Google Slides (short)](https://docs.google.com/presentation/d/1B_uEwOf1bTd7kjoP5N3xi_X3S6s1GArl72QxqhNhwKw)

[Google Slides (comprehensive)](https://docs.google.com/presentation/d/1XVSE_76GHVguBU1Rp5SDC08yKE9jU404dGCqeT6yZT4/edit?usp=sharing)

## Running the project

1. Create a virtual environment and install the dependencies:

```
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

2. Create `backend/.env` from `backend/.example.env` and change the variables to your own
3. Start the server:

```
python app.py
```

## Rebuilding the React frontend

1. Install npm
2. Edit `frontend/.env` according to your own backend server
3. Build the frontend:

```
cd frontend
npm install --legacy-peer-deps
npm run build
```

4. Replace the contents of `backend/dist` with `frontend/dist`
