import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuthHeader } from "react-auth-kit";
axios.defaults.headers.post["Access-Control-Allow-Origin"] = "*";

function App() {
  const [events, setEvents] = useState([""]); 
  const [event, setEvent] = useState(""); // user choice
  const [essay, setEssay] = useState("");
  const [score, setScore] = useState(0); // score for mcq
  const [mcq, setMCQ] = useState([]); 
  const [choices, setChoices] = useState([-1]); // user choice
  const [difficulty, setDifficulty] = useState(1); // 1: easy, 2: medium, 3: hard
  const [displayScore, setDisplayScore] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  // const [seconds, setSeconds] = useState(0);

  const authHeader = useAuthHeader();

  const fetchEvents = async () => {
    try {
    const res = await axios.post(
      import.meta.env.VITE_BACKEND_ENDPOINT + "/challenge_events",
      {},
      {
        headers: {
          Authorization: authHeader(),
        },
      }
    )
    setEvents(res.data.events);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchEssay = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        import.meta.env.VITE_BACKEND_ENDPOINT + "/challenge_essay",
        {
          event: event,
          difficulty: difficulty,
        },
        {
          headers: {
            Authorization: authHeader(),
          },
        }
      )
      setEssay(res.data.essay);
      // console.log(essay);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchMCQ = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        import.meta.env.VITE_BACKEND_ENDPOINT + "/challenge_mcq",
        {},
        {
          headers: {
            Authorization: authHeader(),
          },
        }
      )
      setMCQ(res.data.mcq);
      setChoices(Array(res.data.mcq.length).fill(-1));
      // console.log(res.data.mcq);
      // console.log(mcq);
    } catch (err) {
      console.log(err);
    }
  };

  const storeChoice = (e) => {
    let choices_temp = choices;
    choices_temp[parseInt(e.target.name)] = parseInt(e.target.value);
    // console.log(choices_temp);
    setChoices(choices_temp);
    // console.log(choices);
  };

  const calculateScore = () => {
    let score_temp = 0;
    let choices_temp = choices;
    for (let i = 0; i < mcq.length; i++) {
      if (mcq[i].answer === choices[i]) {
        score_temp++;
        choices_temp[i] = 100; // correct
      }
    };
    try {
      axios.post(
        import.meta.env.VITE_BACKEND_ENDPOINT + "/challenge_score_submit",
        {score: score_temp},
        {
          headers: {
            Authorization: authHeader(),
          },
        }
      )
      // test
      setSubmitted(true);
    } catch (err) {
      console.log(err);
    }
    setScore(score_temp);
    setChoices(choices_temp);
    setDisplayScore(true);
  };

  // execute fetchEvents() when the page is loaded
  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <>
      <div>
        <h1>Challenge</h1>
        <br></br>
        <p>Choose an event.</p>
        {/* let user choose one from events and update event state*/}
        <select onChange={(e) => setEvent(e.target.value)}>
          {events.map((eventItem, index) => (
            <option value={eventItem} key={index}>{eventItem}</option>
          ))}
        </select>
        <br></br>
        {/* randomize button */}
        <button onClick={() => setEvent(events[Math.floor(Math.random() * events.length)])}>Randomize(button)</button>
        {/* display chosen event (for testing)*/}
        <p>(for testing) You chose event: {event}</p>
        <br></br>
        <br></br>
        <p>Choose a difficulty.</p>
        {/* let user choose difficulty and update difficulty state */}
        <select onChange={(e) => setDifficulty(e.target.value)}>
          <option value={1}>Easy</option>
          <option value={2}>Medium</option>
          <option value={3}>Hard</option>
        </select>
        {/* display difficulty (for testing)*/}
        <p>(for testing) You chose difficulty: {difficulty}</p>
        <br></br>
        <br></br>
        {/* fetch essay */}
        <form onSubmit={fetchEssay}>
          <button type="submit">Fetch Essay</button>
        </form>
        {/* display essay*/}
        <p>{essay}</p>
        <br></br>
        <br></br>
        {/* fetch mcq */}
        <form onSubmit={fetchMCQ}>
          <button type="submit">Fetch MCQ</button>
        </form>
        {/* display every mcq[i][query]*/}
        <div>{mcq.map((mcqItem, index) => (
          <div key={index}>
            <p>{mcqItem.query}</p>
            {/* radio button for every mcq[i][choices]*/}
            <input onChange={storeChoice} type="radio" id={`${index}-choice1`} name={`${index}`} value={0}></input>
            <label>{mcqItem.choices[0]}</label><br></br>
            <input onChange={storeChoice} type="radio" id={`${index}-choice1`} name={`${index}`} value={1}></input>
            <label>{mcqItem.choices[1]}</label><br></br>
            <input onChange={storeChoice} type="radio" id={`${index}-choice1`} name={`${index}`} value={2}></input> 
            <label>{mcqItem.choices[2]}</label><br></br>
            <input onChange={storeChoice} type="radio" id={`${index}-choice1`} name={`${index}`} value={3}></input>
            <label>{mcqItem.choices[3]}</label><br></br>
          </div>          
        ))}</div>
        
        <br></br>
        <br></br>

        {/* Button that checks i^th choice against mcq[i][answer]*/}
        <button onClick={calculateScore}>Submit</button>
        <br></br>

        {/* display score */}
        {displayScore && 
          <div>
            <p>Your score is {score}</p>
            <br></br>
            {/* check which choices are correct */}
            {choices.map((choiceItem, index) => (
              <div key={index}>
                <p>Question {index+1} {choiceItem===100 ? 'Correct' : 'Wrong'} </p>
                {choiceItem!==100 && 
                <div>
                  <p>Correct Answer: {mcq[index].answer}</p>
                  <p>Explanation: {mcq[index].explanation}</p>
                </div>
                }
                <br></br>
              </div>
            ))}
          </div>
        }

        {submitted &&
          <div>
            <p>Your score has been submitted.</p>
          </div>
        }


      </div>
    </>
  );
}

export default App;
