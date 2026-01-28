// src/pages/admin/QuestionManagement.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Admin.css';

const QuestionManagement = () => {
  const [questions, setQuestions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [filters, setFilters] = useState({
    subject: '',
    topic: '',
    difficulty: ''
  });
  const [showForm, setShowForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [formData, setFormData] = useState({
    subject: '',
    topic: '',
    questionText: '',
    questionType: 'mcq',
    options: [
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false }
    ],
    correctAnswer: '',
    explanation: '',
    difficulty: 'medium',
    marks: 1,
    timeLimit: 60
  });

  useEffect(() => {
    fetchSubjects();
    fetchQuestions();
  }, []);

  useEffect(() => {
    if (filters.subject) {
      fetchTopicsForSubject(filters.subject);
    }
  }, [filters.subject]);

  useEffect(() => {
    fetchQuestions();
  }, [filters, page]);

  const fetchSubjects = async () => {
    try {
      const response = await axios.get('/api/subjects');
      setSubjects(response.data.data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchTopicsForSubject = async (subjectId) => {
    try {
      const response = await axios.get(`/api/topics?subject=${subjectId}`);
      setTopics(response.data.data);
    } catch (error) {
      console.error('Error fetching topics:', error);
    }
  };

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (filters.subject) params.append('subject', filters.subject);
      if (filters.topic) params.append('topic', filters.topic);
      if (filters.difficulty) params.append('difficulty', filters.difficulty);

      const response = await axios.get(`/api/admin/questions?${params}`);
      setQuestions(response.data.data);
      setTotalPages(response.data.pagination.pages);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
    setPage(1);
  };

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index].text = value;
    setFormData({ ...formData, options: newOptions });
  };

  const handleCorrectAnswerChange = (index) => {
    const newOptions = formData.options.map((opt, idx) => ({
      ...opt,
      isCorrect: idx === index
    }));
    setFormData({
      ...formData,
      options: newOptions,
      correctAnswer: newOptions[index].text
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingQuestion) {
        await axios.put(`/api/admin/questions/${editingQuestion._id}`, formData);
        alert('Question updated successfully!');
      } else {
        await axios.post('/api/admin/questions', formData);
        alert('Question created successfully!');
      }
      
      resetForm();
      fetchQuestions();
    } catch (error) {
      console.error('Error saving question:', error);
      alert('Failed to save question. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (question) => {
    setEditingQuestion(question);
    setFormData({
      subject: question.subject._id,
      topic: question.topic._id,
      questionText: question.questionText,
      questionType: question.questionType,
      options: question.options,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation || '',
      difficulty: question.difficulty,
      marks: question.marks,
      timeLimit: question.timeLimit
    });
    setShowForm(true);
  };

  const handleDelete = async (questionId) => {
    if (!window.confirm('Are you sure you want to delete this question?')) {
      return;
    }

    try {
      await axios.delete(`/api/admin/questions/${questionId}`);
      alert('Question deleted successfully!');
      fetchQuestions();
    } catch (error) {
      console.error('Error deleting question:', error);
      alert('Failed to delete question.');
    }
  };

  const resetForm = () => {
    setFormData({
      subject: '',
      topic: '',
      questionText: '',
      questionType: 'mcq',
      options: [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false }
      ],
      correctAnswer: '',
      explanation: '',
      difficulty: 'medium',
      marks: 1,
      timeLimit: 60
    });
    setEditingQuestion(null);
    setShowForm(false);
  };

  return (
    <div className="question-management">
      <div className="management-header">
        <h1>📝 Question Management</h1>
        <button 
          className="btn-add-question"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : '+ Add New Question'}
        </button>
      </div>

      {/* Question Form */}
      {showForm && (
        <div className="question-form-container">
          <h2>{editingQuestion ? 'Edit Question' : 'Add New Question'}</h2>
          <form onSubmit={handleSubmit} className="question-form">
            <div className="form-row">
              <div className="form-group">
                <label>Subject *</label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={(e) => {
                    handleFormChange(e);
                    fetchTopicsForSubject(e.target.value);
                  }}
                  required
                >
                  <option value="">Select Subject</option>
                  {subjects.map(subject => (
                    <option key={subject._id} value={subject._id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Topic *</label>
                <select
                  name="topic"
                  value={formData.topic}
                  onChange={handleFormChange}
                  required
                  disabled={!formData.subject}
                >
                  <option value="">Select Topic</option>
                  {topics.map(topic => (
                    <option key={topic._id} value={topic._id}>
                      {topic.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Question Text *</label>
              <textarea
                name="questionText"
                value={formData.questionText}
                onChange={handleFormChange}
                rows="3"
                required
              />
            </div>

            <div className="form-group">
              <label>Options *</label>
              {formData.options.map((option, index) => (
                <div key={index} className="option-input">
                  <input
                    type="radio"
                    name="correctAnswer"
                    checked={option.isCorrect}
                    onChange={() => handleCorrectAnswerChange(index)}
                  />
                  <input
                    type="text"
                    value={option.text}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    required
                  />
                  {option.isCorrect && <span className="correct-badge">✓ Correct</span>}
                </div>
              ))}
            </div>

            <div className="form-group">
              <label>Explanation (Optional)</label>
              <textarea
                name="explanation"
                value={formData.explanation}
                onChange={handleFormChange}
                rows="2"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Difficulty *</label>
                <select
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleFormChange}
                  required
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div className="form-group">
                <label>Marks *</label>
                <input
                  type="number"
                  name="marks"
                  value={formData.marks}
                  onChange={handleFormChange}
                  min="1"
                  required
                />
              </div>

              <div className="form-group">
                <label>Time Limit (seconds) *</label>
                <input
                  type="number"
                  name="timeLimit"
                  value={formData.timeLimit}
                  onChange={handleFormChange}
                  min="10"
                  required
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="button" onClick={resetForm} className="btn-cancel">
                Cancel
              </button>
              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? 'Saving...' : editingQuestion ? 'Update Question' : 'Add Question'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <label>Subject:</label>
          <select name="subject" value={filters.subject} onChange={handleFilterChange}>
            <option value="">All Subjects</option>
            {subjects.map(subject => (
              <option key={subject._id} value={subject._id}>{subject.name}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Topic:</label>
          <select 
            name="topic" 
            value={filters.topic} 
            onChange={handleFilterChange}
            disabled={!filters.subject}
          >
            <option value="">All Topics</option>
            {topics.map(topic => (
              <option key={topic._id} value={topic._id}>{topic.name}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Difficulty:</label>
          <select name="difficulty" value={filters.difficulty} onChange={handleFilterChange}>
            <option value="">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>

      {/* Questions List */}
      <div className="questions-list">
        {loading ? (
          <div className="loading">Loading questions...</div>
        ) : questions.length === 0 ? (
          <div className="no-data">No questions found</div>
        ) : (
          questions.map((question, idx) => (
            <div key={question._id} className="question-card">
              <div className="question-header">
                <span className="question-number">Q{(page - 1) * 20 + idx + 1}</span>
                <span className={`difficulty-badge ${question.difficulty}`}>
                  {question.difficulty}
                </span>
              </div>
              
              <p className="question-text">{question.questionText}</p>
              
              <div className="question-meta">
                <span>📚 {question.subject?.name}</span>
                <span>📖 {question.topic?.name}</span>
                <span>⏱️ {question.timeLimit}s</span>
                <span>⭐ {question.marks} mark(s)</span>
              </div>

              <div className="question-actions">
                <button onClick={() => handleEdit(question)} className="btn-edit-small">
                  ✏️ Edit
                </button>
                <button onClick={() => handleDelete(question._id)} className="btn-delete-small">
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            ← Previous
          </button>
          <span>Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default QuestionManagement;