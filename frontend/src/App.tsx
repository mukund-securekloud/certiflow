
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import "./App.css";

const API = "http://localhost:5000/api";

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
};

type Candidate = {
  id: number;
  candidateName: string;
  email: string | null;
  phone: string;
  courseName: string;
  completionDate: string | null;
  status: string;
  certificateId: string | null;
};

type Batch = {
  id: number;
  batchName: string;
  status: string;
  centerId: number;
  center: { name: string };
  _count: { candidates: number };
};

const roleLabels: Record<string, string> = {
  TRAINING_CENTER_ADMIN: "Training Centre",
  DISTRICT_OFFICER: "District Officer",
  QUALITY_OFFICER: "Quality Officer",
  STATE_ADMIN: "State Admin",
};

const emptyCandidate = {
  candidateName: "",
  email: "",
  phone: "",
  courseName: "",
  completionDate: "",
};

function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [selectedBatchId, setSelectedBatchId] = useState<number | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);

  const [showUserForm, setShowUserForm] = useState(false);
  const [batchName, setBatchName] = useState("");

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "TRAINING_CENTER_ADMIN",
  });

  const [candidateForm, setCandidateForm] = useState(emptyCandidate);
  const [showCandidateForm, setShowCandidateForm] = useState(false);

  const [message, setMessage] = useState("");
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [submittingDecision, setSubmittingDecision] = useState<number | null>(null);

  const isTrainingCenter =
    selectedUser?.role === "TRAINING_CENTER_ADMIN";

  const isDistrictOfficer =
    selectedUser?.role === "DISTRICT_OFFICER";

  // FETCH USERS
  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API}/users`);
      const result = await response.json();

      if (!response.ok) {
        setMessage(result.message || "Failed to load users");
        return;
      }

      setUsers(result.data || []);

      setSelectedUser((current) => {
        if (current) {
          return result.data.find(
            (user: User) => user.id === current.id
          ) || null;
        }

        return result.data?.[0] || null;
      });
    } catch {
      setMessage("Cannot connect to backend");
    }
  };

  // FETCH BATCHES
  const fetchBatches = async (centerId?: number) => {
    try {
      const url = centerId
        ? `${API}/batches?centerId=${centerId}`
        : `${API}/batches`;

      const response = await fetch(url);
      const result = await response.json();

      if (!response.ok) {
        setMessage(result.message || "Failed to load batches");
        return;
      }

      setBatches(result.data || []);
    } catch {
      setMessage("Failed to load batches");
    }
  };

  // FETCH CANDIDATES FOR SELECTED BATCH
  const fetchCandidates = async (batchId: number) => {
    setLoadingCandidates(true);
    setCandidates([]);

    try {
      const response = await fetch(`${API}/batches/${batchId}`);
      const result = await response.json();

      if (!response.ok) {
        setMessage(result.message || "Failed to load candidates");
        return;
      }

      setCandidates(result.data?.candidates || []);
    } catch {
      setMessage("Failed to load candidate details");
    } finally {
      setLoadingCandidates(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!selectedUser) {
      setBatches([]);
      setSelectedBatchId(null);
      setCandidates([]);
      return;
    }

    fetchBatches(
      selectedUser.role === "TRAINING_CENTER_ADMIN"
        ? selectedUser.id
        : undefined
    );

    setSelectedBatchId(null);
    setCandidates([]);
    setShowCandidateForm(false);
  }, [selectedUser]);

  useEffect(() => {
    if (selectedBatchId !== null) {
      fetchCandidates(selectedBatchId);
    } else {
      setCandidates([]);
    }
  }, [selectedBatchId]);

  // CREATE USER
  const createUser = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API}/users/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      const result = await response.json();

      if (!response.ok) {
        setMessage(result.message || "Failed to create user");
        return;
      }

      setMessage("User created successfully");

      setNewUser({
        name: "",
        email: "",
        role: "TRAINING_CENTER_ADMIN",
      });

      setShowUserForm(false);
      await fetchUsers();
    } catch {
      setMessage("Cannot connect to backend");
    }
  };

  // CREATE BATCH
  const createBatch = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedUser || !isTrainingCenter) return;

    try {
      const response = await fetch(`${API}/batches/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batchName,
          centerId: selectedUser.id,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setMessage(result.message || "Failed to create batch");
        return;
      }

      setMessage("Batch created successfully");
      setBatchName("");

      await fetchBatches(selectedUser.id);
    } catch {
      setMessage("Cannot connect to backend");
    }
  };

  // ADD CANDIDATE
  const addCandidate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedUser || !selectedBatchId || !isTrainingCenter) return;

    try {
      const response = await fetch(
        `${API}/batches/${selectedBatchId}/candidates`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            centerId: selectedUser.id,
            ...candidateForm,
            email: candidateForm.email || null,
            completionDate: candidateForm.completionDate || null,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setMessage(result.message || "Failed to add candidate");
        return;
      }

      setMessage("Candidate added successfully");
      setCandidateForm(emptyCandidate);
      setShowCandidateForm(false);

      await fetchCandidates(selectedBatchId);
      await fetchBatches(selectedUser.id);
    } catch {
      setMessage("Cannot connect to backend");
    }
  };

  // DISTRICT OFFICER: SUBMIT CANDIDATE DECISION
  const submitCandidateDecision = async (
    candidateId: number,
    decision: string
  ) => {
    if (!selectedUser || !isDistrictOfficer) return;

    setSubmittingDecision(candidateId);

    try {
      const response = await fetch(
        `${API}/batches/candidates/${candidateId}/decision`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            officerId: selectedUser.id,
            decision,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setMessage(result.message || "Failed to submit decision");
        return;
      }

      setMessage(result.message || "Decision recorded successfully");

      if (selectedBatchId !== null) {
        await fetchCandidates(selectedBatchId);
      }

      await fetchBatches();
    } catch {
      setMessage("Cannot connect to backend");
    } finally {
      setSubmittingDecision(null);
    }
  };

  // REFRESH BATCHES
  const refreshBatches = () => {
    fetchBatches(
      isTrainingCenter ? selectedUser?.id : undefined
    );

    if (selectedBatchId !== null) {
      fetchCandidates(selectedBatchId);
    }
  };

  return (
    <div className="app">
      {/* NAVBAR */}
      <header className="navbar">
        <div className="brand">
          <div className="brand-icon">C</div>

          <div>
            <h2>CertiFlow</h2>
            <span>Certificate Management Platform</span>
          </div>
        </div>

        <div className="user-actions">
          <select
            value={selectedUser?.id || ""}
            onChange={(e) => {
              const user = users.find(
                (u) => u.id === Number(e.target.value)
              );

              setSelectedUser(user || null);
            }}
          >
            <option value="">Select user</option>

            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} — {roleLabels[user.role]}
              </option>
            ))}
          </select>

          <button onClick={() => setShowUserForm(true)}>
            + Add User
          </button>
        </div>
      </header>

      <main className="main">
        {/* WELCOME */}
        <section className="welcome">
          <div>
            <p className="eyebrow">DASHBOARD</p>

            <h1>
              Welcome{selectedUser ? `, ${selectedUser.name}` : ""}
            </h1>

            <p>
              {isTrainingCenter
                ? "Manage your training batches and candidates."
                : "Review training batches and monitor certificate progress."}
            </p>
          </div>

          {selectedUser && (
            <div className="role-card">
              <span>Current role</span>
              <strong>{roleLabels[selectedUser.role]}</strong>
            </div>
          )}
        </section>

        {/* MESSAGE */}
        {message && (
          <div className="message">
            {message}

            <button onClick={() => setMessage("")}>×</button>
          </div>
        )}

        {!selectedUser && (
          <section className="panel">
            Please select a user from the top-right dropdown.
          </section>
        )}

        {selectedUser && (
          <>
            {/* STATISTICS */}
            <section className="stats">
              <div className="stat-card">
                <span>Total batches</span>
                <h2>{batches.length}</h2>
              </div>

              <div className="stat-card">
                <span>Draft batches</span>
                <h2>
                  {batches.filter((b) => b.status === "DRAFT").length}
                </h2>
              </div>

              <div className="stat-card">
                <span>Submitted batches</span>
                <h2>
                  {batches.filter((b) => b.status === "SUBMITTED").length}
                </h2>
              </div>
            </section>

            {/* TRAINING CENTRE: CREATE BATCH */}
            {isTrainingCenter && (
              <section className="panel">
                <h2>Create Training Batch</h2>
                <p>Create a batch before adding candidate details.</p>

                <form onSubmit={createBatch} className="inline-form">
                  <input
                    value={batchName}
                    onChange={(e) => setBatchName(e.target.value)}
                    placeholder="Enter batch name"
                    required
                  />

                  <button type="submit">Create Batch</button>
                </form>
              </section>
            )}

            {/* BATCH TABLE */}
            <section className="panel">
              <div className="panel-heading">
                <div>
                  <h2>Training Batches</h2>

                  <p>
                    {isTrainingCenter
                      ? "Your training centre batches."
                      : "Batches available for review."}
                  </p>
                </div>

                <button className="secondary" onClick={refreshBatches}>
                  Refresh
                </button>
              </div>

              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Batch name</th>
                      <th>Training centre</th>
                      <th>Candidates</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {batches.map((batch) => (
                      <tr key={batch.id}>
                        <td>#{batch.id}</td>
                        <td>{batch.batchName}</td>
                        <td>{batch.center?.name || "—"}</td>
                        <td>{batch._count?.candidates ?? 0}</td>

                        <td>
                          <span className="status">{batch.status}</span>
                        </td>

                        <td>
                          <button
                            className="secondary"
                            onClick={() => setSelectedBatchId(batch.id)}
                          >
                            View candidates
                          </button>
                        </td>
                      </tr>
                    ))}

                    {batches.length === 0 && (
                      <tr>
                        <td colSpan={6} className="empty">
                          No batches available.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* CANDIDATE TABLE */}
            {selectedBatchId !== null && (
              <section className="panel">
                <div className="panel-heading">
                  <div>
                    <h2>Candidates – Batch #{selectedBatchId}</h2>

                    <p>
                      Candidate information and current certificate status.
                    </p>
                  </div>

                  {isTrainingCenter && (
                    <button onClick={() => setShowCandidateForm(true)}>
                      + Add Candidate
                    </button>
                  )}
                </div>

                {loadingCandidates ? (
                  <p>Loading candidates...</p>
                ) : (
                  <div className="table-wrapper">
                    <table>
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Candidate name</th>
                          <th>Email</th>
                          <th>Phone</th>
                          <th>Course</th>
                          <th>Completion date</th>
                          <th>Status</th>

                          {isDistrictOfficer && <th>Action</th>}
                        </tr>
                      </thead>

                      <tbody>
                        {candidates.map((candidate) => (
                          <tr key={candidate.id}>
                            <td>#{candidate.id}</td>
                            <td>{candidate.candidateName}</td>
                            <td>{candidate.email || "—"}</td>
                            <td>{candidate.phone}</td>
                            <td>{candidate.courseName}</td>

                            <td>
                              {candidate.completionDate
                                ? new Date(
                                    candidate.completionDate
                                  ).toLocaleDateString()
                                : "—"}
                            </td>

                            <td>
                              <span className="status">
                                {candidate.status}
                              </span>
                            </td>

                            {isDistrictOfficer && (
                              <td>
                                <select
                                  key={`${candidate.id}-${candidate.status}`}
                                  defaultValue=""
                                  disabled={submittingDecision === candidate.id}
                                  onChange={(e) => {
                                    const decision = e.target.value;

                                    if (decision) {
                                      submitCandidateDecision(
                                        candidate.id,
                                        decision
                                      );
                                    }
                                  }}
                                >
                                  <option value="" disabled>
                                    {submittingDecision === candidate.id
                                      ? "Saving..."
                                      : "Change status"}
                                  </option>
                                  <option value="PENDING">Pending</option>
                                  <option value="APPROVED">Approved</option>
                                  <option value="REJECTED">Rejected</option>
                                  <option value="SENT_BACK">Send Back</option>
                                </select>
                              </td>
                            )}
                          </tr>
                        ))}

                        {candidates.length === 0 && (
                          <tr>
                            <td
                              colSpan={isDistrictOfficer ? 8 : 7}
                              className="empty"
                            >
                              No candidates added to this batch yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {isTrainingCenter && (
                  <p className="readonly-note">
                    Candidate status is read-only for training centres.
                  </p>
                )}

                {isDistrictOfficer && (
                  <p className="readonly-note">
                    All District Officers can update candidate statuses.
                  </p>
                )}
              </section>
            )}
          </>
        )}
      </main>

      {/* ADD CANDIDATE MODAL */}
      {showCandidateForm && isTrainingCenter && (
        <div className="modal-overlay">
          <form className="modal" onSubmit={addCandidate}>
            <div className="panel-heading">
              <h2>Add Candidate</h2>

              <button
                type="button"
                className="close"
                onClick={() => setShowCandidateForm(false)}
              >
                ×
              </button>
            </div>

            <label>Candidate name</label>
            <input
              value={candidateForm.candidateName}
              onChange={(e) =>
                setCandidateForm({
                  ...candidateForm,
                  candidateName: e.target.value,
                })
              }
              placeholder="Enter candidate name"
              required
            />

            <label>Email</label>
            <input
              type="email"
              value={candidateForm.email}
              onChange={(e) =>
                setCandidateForm({
                  ...candidateForm,
                  email: e.target.value,
                })
              }
              placeholder="Enter email address"
            />

            <label>Phone number</label>
            <input
              value={candidateForm.phone}
              onChange={(e) =>
                setCandidateForm({
                  ...candidateForm,
                  phone: e.target.value,
                })
              }
              placeholder="Enter phone number"
              required
            />

            <label>Course name</label>
            <input
              value={candidateForm.courseName}
              onChange={(e) =>
                setCandidateForm({
                  ...candidateForm,
                  courseName: e.target.value,
                })
              }
              placeholder="Enter course name"
              required
            />

            <label>Completion date</label>
            <input
              type="date"
              value={candidateForm.completionDate}
              onChange={(e) =>
                setCandidateForm({
                  ...candidateForm,
                  completionDate: e.target.value,
                })
              }
            />

            <button type="submit" className="submit-button">
              Save Candidate
            </button>
          </form>
        </div>
      )}

      {/* ADD USER MODAL */}
      {showUserForm && (
        <div className="modal-overlay">
          <form className="modal" onSubmit={createUser}>
            <div className="panel-heading">
              <h2>Add New User</h2>

              <button
                type="button"
                className="close"
                onClick={() => setShowUserForm(false)}
              >
                ×
              </button>
            </div>

            <label>Name</label>
            <input
              value={newUser.name}
              onChange={(e) =>
                setNewUser({ ...newUser, name: e.target.value })
              }
              placeholder="Enter full name"
              required
            />

            <label>Email</label>
            <input
              type="email"
              value={newUser.email}
              onChange={(e) =>
                setNewUser({ ...newUser, email: e.target.value })
              }
              placeholder="Enter email"
              required
            />

            <label>Role</label>
            <select
              value={newUser.role}
              onChange={(e) =>
                setNewUser({ ...newUser, role: e.target.value })
              }
            >
              {Object.entries(roleLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>

            <button type="submit" className="submit-button">
              Create User
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default App;
