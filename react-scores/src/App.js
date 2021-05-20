import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { Container, Row } from 'react-bootstrap';
import { ExamScores, ExamForm } from './ExamComponents.js';
import AppTitle from './AppTitle.js';
import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import API from './API';


function App() {
  const [courses, setCourses] = useState([]);
  const [exams, setExams] = useState([]);

  const [loading, setLoading] = useState(true); // still loading at mount
  const [dirty, setDirty] = useState(true) ; // exams are dirty

  // Rehydrate courses at mount time
  useEffect(() => {
    API.loadAllCourses().then(newC => setCourses(newC));
  }, []);

  // Rehydrate exams at mount time, and when courses are updated
  useEffect(() => {
    if (courses.length && dirty) {
      API.loadAllExams().then(newEx => {
        setExams(newEx);
        setLoading(false);
        setDirty(false);
      });
    }
  }, [courses.length, dirty]);


  const examCodes = exams.map(exam => exam.coursecode);

  const deleteExam = (coursecode) => {
    setExams((exs) => exs.filter(ex => ex.coursecode !== coursecode))
  }

  const addExam = (exam) => {
    setExams(oldExams => [...oldExams, exam]);

    API.addNewExam(exam).then((err)=>{setDirty(true)}) ;
  }

  const updateExam = (exam) => {
    setExams(oldExams => {
      return oldExams.map(ex => {
        if (ex.coursecode === exam.coursecode)
          return { coursecode: exam.coursecode, score: exam.score, date: exam.date };
        else
          return ex;
      });
    });
  }
  console.log(exams);
  return (<Router>
    <Container className="App">
      <Row>
        <AppTitle />
      </Row>

      <Switch>
        <Route path="/add" render={() =>
          <ExamForm courses={courses.filter(course => !examCodes.includes(course.coursecode))} addOrUpdateExam={addExam}></ExamForm>
        } />

        <Route path="/update" render={() =>
          <ExamForm courses={courses} addOrUpdateExam={updateExam}></ExamForm>
        } />

        <Route path="/" render={() =>
          <Row>
            {loading ? <h2>Please wait...</h2> :
              <ExamScores exams={exams} courses={courses} deleteExam={deleteExam} />
            }
          </Row>
        } />

      </Switch>
    </Container>
  </Router>);
}

export default App;
