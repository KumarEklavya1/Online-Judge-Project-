import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';

export default function ProblemSetter() {
  const { token } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    title: '', description: '', difficulty: 'Medium', timeLimit: 1000, memoryLimit: 256,
  });

  const [testCases, setTestCases] = useState([{ input: '', output: '', isHidden: false }]);
  const [statusMessage, setStatusMessage] = useState('');

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTestCaseChange = (index, field, value) => {
    const updatedTestCases = [...testCases];
    updatedTestCases[index][field] = value;
    setTestCases(updatedTestCases);
  };

  const addTestCase = () => setTestCases([...testCases, { input: '', output: '', isHidden: false }]);
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const removeTestCase = (index) => {
    if (testCases.length === 1) return;
    setTestCases(testCases.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage('saving problem...');
    const problemPayload = { ...formData, testCases };

    try {
      const response = await fetch( `${API_BASE_URL}/api/problems`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(problemPayload),
      });

      const data = await response.json();

      if (response.ok) {
        setStatusMessage('ok: problem created successfully');
        setFormData({ title: '', description: '', difficulty: 'Medium', timeLimit: 1000, memoryLimit: 256 });
        setTestCases([{ input: '', output: '', isHidden: false }]);
      } else {
        setStatusMessage(`error: ${data.message || data.error}`);
      }
    } catch (err) {
      setStatusMessage('error: failed to connect to server');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="font-mono text-lg text-judge-bright mb-1 flex items-center gap-2">
        <span className="text-judge-green">$</span> problems --create
      </h1>
      <p className="font-mono text-xs text-judge-dim mb-6">admin only · publishes immediately</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="card-judge p-6 flex flex-col gap-4">
          <div>
            <label className="font-mono text-[11px] text-judge-dim block mb-1.5">title</label>
            <input name="title" value={formData.title} onChange={handleInputChange} placeholder="Two Sum II" required className="input-judge" />
          </div>
          <div>
            <label className="font-mono text-[11px] text-judge-dim block mb-1.5">description</label>
            <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Problem statement..." required rows={6} className="input-judge resize-y" />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="font-mono text-[11px] text-judge-dim block mb-1.5">difficulty</label>
              <select name="difficulty" value={formData.difficulty} onChange={handleInputChange} className="input-judge">
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
            <div>
              <label className="font-mono text-[11px] text-judge-dim block mb-1.5">time limit (ms)</label>
              <input name="timeLimit" type="number" value={formData.timeLimit} onChange={handleInputChange} required className="input-judge" />
            </div>
            <div>
              <label className="font-mono text-[11px] text-judge-dim block mb-1.5">memory (mb)</label>
              <input name="memoryLimit" type="number" value={formData.memoryLimit} onChange={handleInputChange} required className="input-judge" />
            </div>
          </div>
        </div>

        <div className="card-judge p-6">
          <h2 className="font-mono text-xs uppercase tracking-wide text-judge-dim mb-4 pb-3 border-b border-judge-border"># test cases</h2>
          <div className="flex flex-col gap-4">
            {testCases.map((tc, index) => (
              <div key={index} className="border-l-2 border-judge-green pl-4 py-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs text-judge-bright">test_{String(index + 1).padStart(2, '0')}</span>
                  {testCases.length > 1 && (
                    <button type="button" onClick={() => removeTestCase(index)} className="font-mono text-[11px] text-judge-red hover:underline">remove</button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3 mb-2">
                  <textarea placeholder="input" value={tc.input} onChange={(e) => handleTestCaseChange(index, 'input', e.target.value)} required rows={3} className="input-judge resize-y" />
                  <textarea placeholder="expected output" value={tc.output} onChange={(e) => handleTestCaseChange(index, 'output', e.target.value)} required rows={3} className="input-judge resize-y" />
                </div>
                <label className="font-mono text-[11px] text-judge-dim flex items-center gap-2">
                  <input type="checkbox" checked={tc.isHidden} onChange={(e) => handleTestCaseChange(index, 'isHidden', e.target.checked)} className="accent-judge-green" />
                  hidden test case
                </label>
              </div>
            ))}
            <button type="button" onClick={addTestCase} className="btn-judge text-judge-dim hover:text-judge-green">+ add test case</button>
          </div>
        </div>

        <button type="submit" className="btn-judge btn-judge-primary py-3">publish problem ⏎</button>
        {statusMessage && <p className={`font-mono text-xs ${statusMessage.startsWith('error') ? 'text-judge-red' : 'text-judge-green'}`}>{statusMessage}</p>}
      </form>
    </div>
  );
}