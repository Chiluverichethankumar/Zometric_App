import React from 'react';
import { View, Text, StyleSheet, Alert, Image } from 'react-native';
import { useProfileQuery, useLogoutMutation } from '../../api/authApi';
import { useDispatch, useSelector } from 'react-redux';
import { clearAuth } from '../../store/authSlice';
import type { RootState } from '../../store/store';
import Loading from '../../components/common/Loading';
import Button from '../../components/common/Button';
import Icon from 'react-native-vector-icons/MaterialIcons';

// ✅ Company Logo
import companyLogo from '../../assets/icons/company_logo.png';

const ProfileScreen: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { data, isLoading, error } = useProfileQuery();
  const [logout, { isLoading: logoutLoading }] = useLogoutMutation();
  const dispatch = useDispatch();

  const onLogout = async () => {
    try {
      await logout().unwrap();
    } catch {
      Alert.alert('Logout', 'Server error. Local session cleared.');
    } finally {
      dispatch(clearAuth());
    }
  };

  if (isLoading) return <Loading />;

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Failed to load profile</Text>
        <Button label="Logout" onPress={onLogout} />
      </View>
    );
  }

    const username = data?.username ?? user?.username ?? '';
    const email = data?.email ?? user?.email ?? '';
    const dateJoined = data?.date_joined
      ? new Date(data.date_joined).toLocaleDateString()
      : 'Unknown';


  const initials = username ? username.slice(0, 2).toUpperCase() : 'U';

  return (
    <View style={styles.container}>
      
      {/* Avatar */}
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>

      <Text style={styles.title}>My Profile</Text>

      {/* Info Card */}
      <View style={styles.card}>
        <View style={styles.row}>
          <Icon name="person" size={20} style={styles.icon} />
          <Text style={styles.label}>Username</Text>
          <Text style={styles.value}>{username}</Text>
        </View>

        <View style={styles.row}>
          <Icon name="email" size={20} style={styles.icon} />
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{email}</Text>
        </View>

        <View style={styles.row}>
          <Icon name="calendar-today" size={20} style={styles.icon} />
          <Text style={styles.label}>Joined</Text>
          <Text style={styles.value}>{dateJoined}</Text>
        </View>
      </View>

 
  <Text style={styles.footerText}></Text>
  <Text style={styles.footerText}></Text>
    <Text style={styles.footerText}></Text>
      <Text style={styles.footerText}></Text>
        <Text style={styles.footerText}></Text>

      <Button
        label="Logout"
        onPress={onLogout}
        loading={logoutLoading}
        style={styles.logoutBtn}
      />
           {/* 🔵 Circular Logo */}
      <View style={styles.logoContainer}>
        <Image source={companyLogo} style={styles.logo} />
      </View>

      <Text style={styles.footerText}>Powered by Zometric CRM</Text>
    </View>
    
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20,
    backgroundColor: '#EEF1F6',
    alignItems: 'center',
  },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },

  avatarText: {
    fontSize: 32,
    color: 'white',
    fontWeight: 'bold',
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    marginVertical: 20,
    color: '#1E3A8A',
  },

  card: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 18,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
  },

  row: {
    marginBottom: 14,
  },

  icon: {
    position: 'absolute',
    left: 0,
    top: 4,
    color: '#475569',
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginLeft: 28,
  },

  value: {
    fontSize: 16,
    color: '#1E293B',
    marginLeft: 28,
  },

  logoutBtn: {
    marginTop: 25,
    width: '100%',
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  error: {
    color: 'red',
    marginBottom: 12,
  },

  // 🔵 Circular logo container
  logoContainer: {
    width: 50,
    height: 50,
    borderRadius: 100,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
  },

  // Logo inside circle
  logo: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },

  footerText: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 10,
    marginBottom: 15,
    textAlign: 'center',
  },
});

export default ProfileScreen;
