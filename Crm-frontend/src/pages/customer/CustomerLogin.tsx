import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import customerAuthService from '../../services/customerAuthService';
import { NeedHelp } from '../../components/ui';

const CustomerLogin: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [requirePasswordChange, setRequirePasswordChange] = useState(false);
  const [customerId, setCustomerId] = useState<number | null>(null);
    const navigate = useNavigate();

  // Redirect if customer is already logged in
  useEffect(() => {
    if (customerAuthService.isAuthenticated()) {
      console.log('Customer already logged in, redirecting to tickets');
      navigate('/customer/tickets', { replace: true });
    }
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await customerAuthService.login(formData);
      
      if (response.success) {
        if (response.requirePasswordChange) {
          setRequirePasswordChange(true);
          setCustomerId(response.customerId!);
        } else {
          navigate('/customer/tickets');
        }
      } else {
        setError(response.message || 'Login failed');
      }
    } catch (error) {
      setError('An error occurred during login');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formDataFromForm = new FormData(form);
    const newPassword = formDataFromForm.get('newPassword') as string;
    const confirmPassword = formDataFromForm.get('confirmPassword') as string;

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await customerAuthService.changePassword({
        customerId: customerId!,
        currentPassword: formData.password,
        newPassword
      });

      if (response.success) {
        navigate('/customer/tickets');
      } else {
        setError(response.message || 'Password change failed');
      }
    } catch (error) {
      setError('An error occurred during password change');
      console.error('Password change error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (requirePasswordChange) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#f9fafb',
        background: 'linear-gradient(to right, #8B4513, #D2691E)'
      }}>
        <div style={{ 
          padding: '20px 30px', 
          backgroundColor: 'rgba(255, 255, 255, 0.95)', 
          backdropFilter: 'blur(6px)',
          minHeight: '100vh'
        }}>
          {/* Header for password change */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '40px',
            padding: '15px 0',
            borderBottom: '1px solid #e5e7eb'
          }}>
            <h1 style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              color: '#8B4513',
              margin: 0
            }}>
              🐝 Bee Furniture - Customer Portal
            </h1>
            <button
              onClick={() => navigate('/')}
              style={{
                padding: '8px 16px',
                backgroundColor: 'transparent',
                color: '#8B4513',
                border: '2px solid #8B4513',
                borderRadius: '6px',
                fontWeight: '600',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                textDecoration: 'none'
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = '#8B4513';
                (e.target as HTMLButtonElement).style.color = 'white';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = 'transparent';
                (e.target as HTMLButtonElement).style.color = '#8B4513';
              }}
            >
              ← Back to Home
            </button>
          </div>

          {/* Main Content */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 'calc(100vh - 140px)'
          }}>
            <div style={{
              maxWidth: '420px',
              width: '100%',
              backgroundColor: 'white',
              padding: '40px',
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔐</div>
                <h2 style={{
                  fontSize: '28px',
                  fontWeight: 'bold',
                  color: '#8B4513',
                  marginBottom: '12px'
                }}>
                  Change Your Password
                </h2>
                <p style={{
                  fontSize: '16px',
                  color: '#6b5b47',
                  lineHeight: '1.5'
                }}>
                  This is your first login. Please change your password to continue.
                </p>
              </div>

              <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#8B4513',
                    marginBottom: '8px'
                  }}>
                    New Password
                  </label>
                  <input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    required
                    minLength={6}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '16px',
                      transition: 'border-color 0.2s',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    placeholder="Enter new password"
                    onFocus={(e) => e.target.style.borderColor = '#D2691E'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#8B4513',
                    marginBottom: '8px'
                  }}>
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    minLength={6}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '16px',
                      transition: 'border-color 0.2s',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    placeholder="Confirm new password"
                    onFocus={(e) => e.target.style.borderColor = '#D2691E'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>

                {error && (
                  <div style={{
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#dc2626',
                    padding: '12px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    textAlign: 'center'
                  }}>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '12px 24px',
                    backgroundColor: loading ? '#9ca3af' : '#8B4513',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.3s',
                    marginTop: '8px'
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) (e.target as HTMLButtonElement).style.backgroundColor = '#6b3410';
                  }}
                  onMouseLeave={(e) => {
                    if (!loading) (e.target as HTMLButtonElement).style.backgroundColor = '#8B4513';
                  }}
                >                  {loading ? 'Changing Password...' : 'Change Password'}
                </button>
              </form>

              {/* Need Help Section */}
              <NeedHelp 
                variant="customer"
                title="Need Help?"
                description="Contact our customer support team for assistance with your account or products."
                contacts={[
                  { icon: "📱", label: "Phone", value: "+62 812-3456-7890", type: "phone" },
                  { icon: "✉️", label: "Email", value: "help@beefurniture.com", type: "email" }
                ]}
                style={{ marginTop: '32px' }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f9fafb',
      background: 'linear-gradient(to right, #8B4513, #D2691E)'
    }}>
      <div style={{ 
        padding: '20px 30px', 
        backgroundColor: 'rgba(255, 255, 255, 0.95)', 
        backdropFilter: 'blur(6px)',
        minHeight: '100vh'
      }}>
        {/* Header for non-authenticated users */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '40px',
          padding: '15px 0',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <h1 style={{ 
            fontSize: '24px', 
            fontWeight: 'bold', 
            color: '#8B4513',
            margin: 0
          }}>
            🐝 Bee Furniture - Customer Portal
          </h1>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '8px 16px',
              backgroundColor: 'transparent',
              color: '#8B4513',
              border: '2px solid #8B4513',
              borderRadius: '6px',
              fontWeight: '600',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              textDecoration: 'none'
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = '#8B4513';
              (e.target as HTMLButtonElement).style.color = 'white';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = 'transparent';
              (e.target as HTMLButtonElement).style.color = '#8B4513';
            }}
          >
            ← Back to Home
          </button>
        </div>

        {/* Main Content */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 'calc(100vh - 140px)'
        }}>
          {/* Login Form */}
          <div style={{
            maxWidth: '420px',
            width: '100%',
            backgroundColor: 'white',
            padding: '40px',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>👤</div>
              <h2 style={{
                fontSize: '28px',
                fontWeight: 'bold',
                color: '#8B4513',
                marginBottom: '12px'
              }}>
                Customer Portal
              </h2>
              <p style={{
                fontSize: '16px',
                color: '#6b5b47',
                lineHeight: '1.5'
              }}>
                Sign in to access your account and submit support tickets
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#8B4513',
                  marginBottom: '8px'
                }}>
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '16px',
                    transition: 'border-color 0.2s',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onFocus={(e) => (e.target as HTMLInputElement).style.borderColor = '#D2691E'}
                  onBlur={(e) => (e.target as HTMLInputElement).style.borderColor = '#e5e7eb'}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#8B4513',
                  marginBottom: '8px'
                }}>
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '16px',
                    transition: 'border-color 0.2s',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  onFocus={(e) => (e.target as HTMLInputElement).style.borderColor = '#D2691E'}
                  onBlur={(e) => (e.target as HTMLInputElement).style.borderColor = '#e5e7eb'}
                />
              </div>

              {error && (
                <div style={{
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#dc2626',
                  padding: '12px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  textAlign: 'center'
                }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '12px 24px',
                  backgroundColor: loading ? '#9ca3af' : '#8B4513',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.3s',
                  marginTop: '8px'
                }}
                onMouseEnter={(e) => {
                  if (!loading) (e.target as HTMLButtonElement).style.backgroundColor = '#6b3410';
                }}
                onMouseLeave={(e) => {
                  if (!loading) (e.target as HTMLButtonElement).style.backgroundColor = '#8B4513';
                }}
              >                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            {/* Need Help Section */}
            <NeedHelp 
              variant="customer"
              title="Need Help?"
              description="Contact our customer support team for assistance with your account or products."
              contacts={[
                { icon: "📱", label: "Phone", value: "+62 812-3456-7890", type: "phone" },
                { icon: "✉️", label: "Email", value: "help@beefurniture.com", type: "email" }
              ]}
              style={{ marginTop: '32px' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerLogin;
