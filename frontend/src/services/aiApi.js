import { apiRequest, API_BASE } from './api';

// ─── AI API — ALL CALLS GO THROUGH BACKEND PROXY ─────────────────────────
// The Gemini API key lives in backend/.env only. Frontend never touches it.
export const GeminiAPI = {
  BASE: API_BASE,

  async _post(endpoint, body) {
    return apiRequest('POST', endpoint, body);
  },

  async chat(messages) {
    const data = await this._post('/api/ai/chat', { messages });
    return data.reply || 'No response generated.';
  },

  async call(prompt, systemContext = '') {
    const messages = [{ role: 'user', content: systemContext ? systemContext + '\n\n' + prompt : prompt }];
    return this.chat(messages);
  },

  async generateQuiz(topic, numQuestions = 5, difficulty = 'medium', type = 'mcq') {
    const data = await this._post('/api/ai/quiz', { topic, numQuestions, difficulty, type });
    return data.quiz && data.quiz.length ? data.quiz : { raw: data.raw };
  },

  async summarize(notes, subject, style = 'concise') {
    const data = await this._post('/api/ai/summarize', { notes, subject, style });
    return data.summary || '';
  },

  async generatePlan(subjects, days = 5, hoursPerDay = 3, goal = 'revision', level = 'intermediate') {
    const data = await this._post('/api/ai/plan', { subjects, days, hoursPerDay, goal, level });
    return data.plan && data.plan.length ? data.plan : { raw: data.raw };
  }
};

// ─── Backend-backed CRUD for quiz results / study plans / summaries ───
export const BackendAPI = {
  async saveQuizResult(payload) { return apiRequest('POST', '/api/quiz', payload); },
  async listQuizResults() { return apiRequest('GET', '/api/quiz'); },

  async savePlan(payload) { return apiRequest('POST', '/api/plan', payload); },
  async listPlans() { return apiRequest('GET', '/api/plan'); },

  async saveSummary(payload) { return apiRequest('POST', '/api/summary', payload); },
  async listSummaries() { return apiRequest('GET', '/api/summary'); },

  async getProgress() { return apiRequest('GET', '/api/progress'); }
};

// ─── Admin API ───
export const AdminAPI = {
  async stats() { return apiRequest('GET', '/api/admin/stats'); },
  async listUsers(params = '') { return apiRequest('GET', '/api/admin/users' + params); },
  async getUser(id) { return apiRequest('GET', `/api/admin/users/${id}`); },
  async getUserActivity(id) { return apiRequest('GET', `/api/admin/users/${id}/activity`); },
  async updateUser(id, updates) { return apiRequest('PUT', `/api/admin/users/${id}`, updates); },
  async deleteUser(id) { return apiRequest('DELETE', `/api/admin/users/${id}`); }
};
