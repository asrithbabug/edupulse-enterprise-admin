'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import { api } from '@/lib/api';

const boardOptions = ['CBSE', 'ICSE', 'State Board'];
const schoolTypeOptions = ['Primary', 'Secondary', 'Higher Secondary', 'All'];
const planOptions = ['Basic', 'Standard', 'Premium'];

const locationHierarchy = {
  'Andhra Pradesh': {
    Anantapur: {
      Tadipatri: ['Yadiki', 'Peddapappur', 'Ramagiri'],
      Gooty: ['Peddavadugur', 'Guntakal Rural', 'Mamidipalli'],
      Uravakonda: ['Beluguppa', 'Vidapanakal', 'Rayadurgam Rural'],
    },
    Chittoor: {
      Tirupati: ['Renigunta', 'Yerpedu', 'Thondavada'],
      Madanapalle: ['B.Kothakota', 'Nimmanapalle', 'Kurabalakota'],
      Punganur: ['Sodam', 'Somala', 'Chowdepalle'],
    },
    Kurnool: {
      Adoni: ['Peddakadubur', 'Kosigi', 'Aspari'],
      Nandyal: ['Gospadu', 'Sanjamala', 'Banaganapalle'],
      Kurnool: ['Orvakal', 'Kodumur', 'C.Belagal'],
    },
    'East Godavari': {
      Kakinada: ['Samalkota', 'Pithapuram', 'Gollaprolu'],
      Rajahmundry: ['Korukonda', 'Seethanagaram', 'Kadiam'],
      Amalapuram: ['Allavaram', 'Mummidivaram', 'Ambajipeta'],
    },
  },
  Telangana: {
    Hyderabad: {
      Amberpet: ['Golnaka', 'Ramanthapur', 'Barkatpura'],
      Secunderabad: ['Maredpally', 'Trimulgherry', 'Bowenpally'],
      Charminar: ['Shalibanda', 'Bahadurpura', 'Falaknuma'],
    },
    Warangal: {
      Hanamkonda: ['Kakaji Colony', 'Subedari', 'Kumarpally'],
      Parkal: ['Atmakur', 'Sangam', 'Shayampet'],
      Narsampet: ['Chennaraopet', 'Duggondi', 'Nallabelly'],
    },
    Nizamabad: {
      Bodhan: ['Erajpally', 'Hunsa', 'Mavandi Kalan'],
      Armoor: ['Mendora', 'Nandipet', 'Mupkal'],
      Bheemgal: ['Velpur', 'Dichpally', 'Makloor'],
    },
    Karimnagar: {
      Huzurabad: ['Veenavanka', 'Jammikunta', 'Shankarapatnam'],
      Jagtial: ['Mallapur', 'Raikal', 'Sarangapur'],
      Manakondur: ['Thimmapur', 'Vavilala', 'Ganneruvaram'],
    },
  },
};

function Field({ label, required, error, helperText, children }) {
  return (
    <div>
      <label className="text-sm font-medium text-text-secondary mb-1 block">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {helperText && <p className="text-xs text-text-secondary mt-1">{helperText}</p>}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

function SectionTitle({ title }) {
  return (
    <div className="border-b border-border pb-2 mb-4">
      <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wide">{title}</h3>
    </div>
  );
}

export default function AddSchoolPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    // School Information
    schoolName: '',
    udiseCode: '',
    board: '',
    schoolType: '',
    // Address
    addressLine: '',
    state: '',
    district: '',
    mandal: '',
    city: '',
    pincode: '',
    // Primary Admin Contact
    adminName: '',
    adminEmail: '',
    adminMobile: '',
    // Subscription
    plan: '',
    startDate: new Date().toISOString().split('T')[0],
    maxStudents: '',
    maxTeachers: '',
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const handleStateChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      state: value,
      district: '',
      mandal: '',
    }));
    setErrors((prev) => ({ ...prev, state: undefined, district: undefined, mandal: undefined }));
  };

  const handleDistrictChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      district: value,
      mandal: '',
    }));
    setErrors((prev) => ({ ...prev, district: undefined, mandal: undefined }));
  };

  const handleMandalChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      mandal: value,
    }));
    setErrors((prev) => ({ ...prev, mandal: undefined }));
  };

  const districtOptions = formData.state ? Object.keys(locationHierarchy[formData.state] || {}) : [];
  const mandalOptions = formData.state && formData.district
    ? Object.keys(locationHierarchy[formData.state]?.[formData.district] || {})
    : [];

  const validate = () => {
    const errs = {};
    if (!formData.schoolName.trim()) errs.schoolName = 'School name is required';
    if (!formData.udiseCode.trim()) errs.udiseCode = 'U-DISE code is required';
    if (!formData.board) errs.board = 'Board is required';
    if (!formData.schoolType) errs.schoolType = 'School type is required';
    if (!formData.state) errs.state = 'State is required';
    if (!formData.district.trim()) errs.district = 'District is required';
    if (!formData.mandal.trim()) errs.mandal = 'Mandal is required';
    if (!formData.city.trim()) errs.city = 'City is required';
    if (formData.pincode && !/^\d{6}$/.test(formData.pincode)) errs.pincode = 'Pincode must be 6 digits';
    if (!formData.adminName.trim()) errs.adminName = 'Admin name is required';
    if (!formData.adminEmail.trim()) errs.adminEmail = 'Official email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.adminEmail)) errs.adminEmail = 'Invalid email';
    if (!formData.adminMobile.trim()) errs.adminMobile = 'Mobile number is required';
    else if (!/^\d{10}$/.test(formData.adminMobile.replace(/\D/g, ''))) errs.adminMobile = 'Mobile number must be 10 digits';
    if (!formData.plan) errs.plan = 'Plan is required';
    if (!formData.startDate) errs.startDate = 'Start date is required';
    if (!formData.maxStudents) errs.maxStudents = 'Max students is required';
    else if (isNaN(parseInt(formData.maxStudents))) errs.maxStudents = 'Must be a valid number';
    if (!formData.maxTeachers) errs.maxTeachers = 'Max teachers is required';
    else if (isNaN(parseInt(formData.maxTeachers))) errs.maxTeachers = 'Must be a valid number';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        name: formData.schoolName,
        udise_code: formData.udiseCode,
        board: formData.board,
        type: formData.schoolType,
        address_line: formData.addressLine,
        state: formData.state,
        district: formData.district,
        mandal: formData.mandal,
        city: formData.city,
        pincode: formData.pincode,
        admin_name: formData.adminName,
        admin_email: formData.adminEmail,
        admin_mobile: formData.adminMobile,
        plan: formData.plan,
        start_date: formData.startDate,
        max_students: parseInt(formData.maxStudents),
        max_teachers: parseInt(formData.maxTeachers),
      };
      await api.post('/enterprise/schools', payload);
      router.push('/enterprise/schools');
    } catch (err) {
      setErrors({ submit: err.message || 'Failed to create school. Please try again.' });
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6 max-w-4xl">

      {/* Page Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeftIcon className="w-5 h-5 text-text-secondary" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <BuildingOfficeIcon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-text-primary">Add School</h2>
            <p className="text-text-secondary text-sm mt-0.5">Register a new school on EduPulse</p>
          </div>
        </div>
      </div>

      {errors.submit && (
        <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{errors.submit}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ── 1. School Information ── */}
        <div className="bg-white rounded-xl border border-border p-6">
          <SectionTitle title="1. School Information" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="School Name" required error={errors.schoolName}>
              <input
                type="text"
                value={formData.schoolName}
                onChange={e => handleChange('schoolName', e.target.value)}
                className={`input-field ${errors.schoolName ? 'border-red-400' : ''}`}
                placeholder="Official school name"
              />
            </Field>
            <Field label="U-DISE Code" required error={errors.udiseCode} helperText="Enter the government issued U-DISE code">
              <input
                type="text"
                value={formData.udiseCode}
                onChange={e => handleChange('udiseCode', e.target.value)}
                className={`input-field ${errors.udiseCode ? 'border-red-400' : ''}`}
                placeholder="e.g. 28150701001"
              />
            </Field>
            <Field label="Board" required error={errors.board}>
              <select
                value={formData.board}
                onChange={e => handleChange('board', e.target.value)}
                className={`input-field ${errors.board ? 'border-red-400' : ''}`}
              >
                <option value="">Select Board</option>
                {boardOptions.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </Field>
            <Field label="School Type" required error={errors.schoolType}>
              <select
                value={formData.schoolType}
                onChange={e => handleChange('schoolType', e.target.value)}
                className={`input-field ${errors.schoolType ? 'border-red-400' : ''}`}
              >
                <option value="">Select Type</option>
                {schoolTypeOptions.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
          </div>
        </div>

        {/* ── 2. Address ── */}
        <div className="bg-white rounded-xl border border-border p-6">
          <SectionTitle title="2. Address" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Address Line" error={errors.addressLine}>
              <input
                type="text"
                value={formData.addressLine}
                onChange={e => handleChange('addressLine', e.target.value)}
                className={`input-field ${errors.addressLine ? 'border-red-400' : ''}`}
                placeholder="Street address"
              />
            </Field>
            <Field label="State" required error={errors.state}>
              <select
                value={formData.state}
                onChange={e => handleStateChange(e.target.value)}
                className={`input-field ${errors.state ? 'border-red-400' : ''}`}
              >
                <option value="">Select State</option>
                {Object.keys(locationHierarchy).map((state) => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </Field>
            <Field label="District" required error={errors.district}>
              <select
                value={formData.district}
                onChange={e => handleDistrictChange(e.target.value)}
                disabled={!formData.state}
                className={`input-field ${errors.district ? 'border-red-400' : ''} ${!formData.state ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}`}
              >
                <option value="">Select District</option>
                {districtOptions.map((district) => (
                  <option key={district} value={district}>{district}</option>
                ))}
              </select>
            </Field>
            <Field label="Mandal" required error={errors.mandal}>
              <select
                value={formData.mandal}
                onChange={e => handleMandalChange(e.target.value)}
                disabled={!formData.district}
                className={`input-field ${errors.mandal ? 'border-red-400' : ''} ${!formData.district ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}`}
              >
                <option value="">Select Mandal</option>
                {mandalOptions.map((mandal) => (
                  <option key={mandal} value={mandal}>{mandal}</option>
                ))}
              </select>
            </Field>
            <Field label="City" required error={errors.city}>
              <input
                type="text"
                value={formData.city}
                onChange={e => handleChange('city', e.target.value)}
                className={`input-field ${errors.city ? 'border-red-400' : ''}`}
                placeholder="City name"
              />
            </Field>
            <Field label="Pincode" error={errors.pincode}>
              <input
                type="text"
                value={formData.pincode}
                onChange={e => handleChange('pincode', e.target.value)}
                className={`input-field ${errors.pincode ? 'border-red-400' : ''}`}
                placeholder="6-digit pincode"
                maxLength={6}
              />
            </Field>
          </div>
        </div>

        {/* ── 3. Primary Admin Contact ── */}
        <div className="bg-white rounded-xl border border-border p-6">
          <SectionTitle title="3. Primary Admin Contact" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Admin Full Name" required error={errors.adminName}>
              <input
                type="text"
                value={formData.adminName}
                onChange={e => handleChange('adminName', e.target.value)}
                className={`input-field ${errors.adminName ? 'border-red-400' : ''}`}
                placeholder="Full name"
              />
            </Field>
            <Field label="Official Email ID" required error={errors.adminEmail} helperText="Login credentials will be sent to this email">
              <input
                type="email"
                value={formData.adminEmail}
                onChange={e => handleChange('adminEmail', e.target.value)}
                className={`input-field ${errors.adminEmail ? 'border-red-400' : ''}`}
                placeholder="admin@school.com"
              />
            </Field>
            <Field label="Mobile Number" required error={errors.adminMobile}>
              <input
                type="tel"
                value={formData.adminMobile}
                onChange={e => handleChange('adminMobile', e.target.value)}
                className={`input-field ${errors.adminMobile ? 'border-red-400' : ''}`}
                placeholder="10-digit mobile number"
                maxLength={10}
              />
            </Field>
          </div>
        </div>

        {/* ── 4. Subscription ── */}
        <div className="bg-white rounded-xl border border-border p-6">
          <SectionTitle title="4. Subscription" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Plan" required error={errors.plan}>
              <select
                value={formData.plan}
                onChange={e => handleChange('plan', e.target.value)}
                className={`input-field ${errors.plan ? 'border-red-400' : ''}`}
              >
                <option value="">Select Plan</option>
                {planOptions.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </Field>
            <Field label="Start Date" required error={errors.startDate}>
              <input
                type="date"
                value={formData.startDate}
                onChange={e => handleChange('startDate', e.target.value)}
                className={`input-field ${errors.startDate ? 'border-red-400' : ''}`}
              />
            </Field>
            <Field label="Max Students" required error={errors.maxStudents}>
              <input
                type="number"
                value={formData.maxStudents}
                onChange={e => handleChange('maxStudents', e.target.value)}
                className={`input-field ${errors.maxStudents ? 'border-red-400' : ''}`}
                placeholder="e.g. 500"
                min="1"
              />
            </Field>
            <Field label="Max Teachers" required error={errors.maxTeachers}>
              <input
                type="number"
                value={formData.maxTeachers}
                onChange={e => handleChange('maxTeachers', e.target.value)}
                className={`input-field ${errors.maxTeachers ? 'border-red-400' : ''}`}
                placeholder="e.g. 50"
                min="1"
              />
            </Field>
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="bg-white rounded-xl border border-border p-4 flex justify-end gap-3">
          <button type="button" onClick={() => router.back()} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
            {saving ? 'Creating...' : 'Create School & Send Credentials'}
          </button>
        </div>

      </form>
    </div>
  );
}
