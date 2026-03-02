import { useState } from "react";
import { supabase } from "../../services/supabase";
import { useNavigate, Link } from "react-router-dom";
import "../../styles/auth.css";
type Role = "freelancer" | "company";

export default function Signup() {
  
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("freelancer");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Create Auth User
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    const user = data.user;

    if (!user) {
      alert("User creation failed");
      setLoading(false);
      return;
    }

    //Insert into profiles table
    const { error: profileError } = await supabase
      .from("profiles")
      .insert([
        {
          id: user.id,
          role,
          full_name: "",
        },
      ]);

    if (profileError) {
      alert(profileError.message);
      setLoading(false);
      return;
    }

    alert("Account created successfully!");
    navigate("/login");
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Create Account</h2>
  
        <form onSubmit={handleSignup}>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
  
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
  
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
          >
            <option value="freelancer">I am a Freelancer</option>
            <option value="company">I am a Company</option>
          </select>
  
          <button type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>
  
        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}