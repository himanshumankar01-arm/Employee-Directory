import { useState } from "react";

const INITIAL_EMPLOYEES = [
  { id: 1, name: "Aarav Sharma", role: "Frontend Developer", dept: "Engineering" },
  { id: 2, name: "Priya Patel", role: "HR Manager", dept: "Human Resources" },
  { id: 3, name: "Rohan Deshmukh", role: "Backend Developer", dept: "Engineering" },
  { id: 4, name: "Sneha Kulkarni", role: "Accountant", dept: "Finance" },
  { id: 5, name: "Vikram Singh", role: "Sales Executive", dept: "Sales" },
  { id: 6, name: "Ananya Iyer", role: "UI/UX Designer", dept: "Design" },
];

const DEPARTMENTS = [
  "Engineering",
  "Human Resources",
  "Finance",
  "Sales",
  "Marketing",
  "Design",
];

/* ---------- Add Employee form ---------- */
function AddEmployeeForm({ onAdd }) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [dept, setDept] = useState(DEPARTMENTS[0]);
  const [error, setError] = useState("");

  const submit = (e) => {
    e.preventDefault();
    const err = onAdd({ name: name.trim(), role: role.trim(), dept });
    if (err) {
      setError(err);
      return;
    }
    setName("");
    setRole("");
    setDept(DEPARTMENTS[0]);
    setError("");
  };

  return (
    <form className="add-form" onSubmit={submit}>
      <h2>Add New Employee</h2>
      <div className="form-row">
        <input
          placeholder="Employee name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          placeholder="Role (e.g. Developer)"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        />
        <select value={dept} onChange={(e) => setDept(e.target.value)}>
          {DEPARTMENTS.map((d) => (
            <option key={d}>{d}</option>
          ))}
        </select>
        <button type="submit" className="add-btn">
          + Add
        </button>
      </div>
      {error && <p className="error">{error}</p>}
    </form>
  );
}

/* ---------- One list box ---------- */
function EmployeeList({ title, items, selected, onToggle, onSelectAll }) {
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const visible = items.filter(
    (e) =>
      e.name.toLowerCase().includes(q) ||
      e.role.toLowerCase().includes(q) ||
      e.dept.toLowerCase().includes(q)
  );
  const allSelected =
    visible.length > 0 && visible.every((e) => selected.includes(e.id));

  return (
    <div className="box">
      <div className="box-header">
        <h2>{title}</h2>
        <span className="count">{items.length}</span>
      </div>

      <div className="box-tools">
        <input
          className="search"
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <label className="select-all">
          <input
            type="checkbox"
            checked={allSelected}
            disabled={visible.length === 0}
            onChange={() => onSelectAll(visible.map((e) => e.id), allSelected)}
          />
          All
        </label>
      </div>

      <ul className="list">
        {visible.length === 0 && (
          <li className="empty">
            {items.length === 0 ? "No employees" : "No match found"}
          </li>
        )}
        {visible.map((emp) => (
          <li
            key={emp.id}
            className={selected.includes(emp.id) ? "item selected" : "item"}
            onClick={() => onToggle(emp.id)}
          >
            <input
              type="checkbox"
              checked={selected.includes(emp.id)}
              onChange={() => onToggle(emp.id)}
              onClick={(e) => e.stopPropagation()}
            />
            <div>
              <div className="name">{emp.name}</div>
              <div className="meta">
                {emp.role} · {emp.dept}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------- Main app ---------- */
export default function App() {
  const [left, setLeft] = useState(INITIAL_EMPLOYEES);
  const [right, setRight] = useState([]);
  const [leftSel, setLeftSel] = useState([]);
  const [rightSel, setRightSel] = useState([]);
  const [nextId, setNextId] = useState(INITIAL_EMPLOYEES.length + 1);

  const toggle = (setter) => (id) =>
    setter((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const selectAll = (setter) => (ids, wasAllSelected) =>
    setter((prev) =>
      wasAllSelected
        ? prev.filter((id) => !ids.includes(id))
        : [...new Set([...prev, ...ids])]
    );

  // Returns an error message string, or "" on success.
  const addEmployee = ({ name, role, dept }) => {
    if (!name) return "Employee name is required.";
    if (!role) return "Role is required.";
    const exists = [...left, ...right].some(
      (e) => e.name.toLowerCase() === name.toLowerCase()
    );
    if (exists) return "This employee already exists.";
    setLeft((prev) => [...prev, { id: nextId, name, role, dept }]);
    setNextId((n) => n + 1);
    return "";
  };

  // Moves selected employees; if nothing is selected, moves the first one.
  const move = (from, setFrom, to, setTo, sel, setSel) => {
    if (from.length === 0) return;
    const ids = sel.length > 0 ? sel : [from[0].id];
    const moving = from.filter((e) => ids.includes(e.id));
    setFrom(from.filter((e) => !ids.includes(e.id)));
    setTo([...to, ...moving]);
    setSel([]);
  };

  const pushRight = () => move(left, setLeft, right, setRight, leftSel, setLeftSel);
  const pushLeft = () => move(right, setRight, left, setLeft, rightSel, setRightSel);

  return (
    <div className="page">
      <h1>Company Employee Management</h1>
      <p className="subtitle">
        Add employees, then use the arrows to move them between the lists.
      </p>

      <AddEmployeeForm onAdd={addEmployee} />

      <div className="transfer">
        <EmployeeList
          title="All Employees"
          items={left}
          selected={leftSel}
          onToggle={toggle(setLeftSel)}
          onSelectAll={selectAll(setLeftSel)}
        />

        <div className="buttons">
          <button
            onClick={pushRight}
            disabled={left.length === 0}
            aria-label="Move to right"
            title="Move to right"
          >
            →
          </button>
          <button
            onClick={pushLeft}
            disabled={right.length === 0}
            aria-label="Move to left"
            title="Move to left"
          >
            ←
          </button>
        </div>

        <EmployeeList
          title="Assigned Employees"
          items={right}
          selected={rightSel}
          onToggle={toggle(setRightSel)}
          onSelectAll={selectAll(setRightSel)}
        />
      </div>
    </div>
  );
}
