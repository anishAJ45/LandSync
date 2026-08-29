import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { RoleProtectedRoute } from './components/auth/RoleProtectedRoute';
import { DashboardLayout } from './components/layout/DashboardLayout';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { UnauthorizedPage } from './pages/auth/UnauthorizedPage';

// Citizen Pages
import { CitizenDashboard } from './pages/citizen/CitizenDashboard';
import { CitizenLandRecords } from './pages/citizen/CitizenLandRecords';
import { CitizenApplications } from './pages/citizen/CitizenApplications';
import { CreateRequest } from './pages/citizen/CreateRequest';
import { MyApplications } from './pages/citizen/MyApplications';

// Officer Pages
import { OfficerDashboard } from './pages/officer/OfficerDashboard';
import { OfficerVerificationCases } from './pages/officer/OfficerVerificationCases';
import { ReviewQueue } from './pages/officer/ReviewQueue';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminSystemOverview } from './pages/admin/AdminSystemOverview';
import { AdminAnalytics } from './pages/admin/AdminAnalytics';

// Common Authenticated Pages
import { ProfilePage } from './pages/common/ProfilePage';
import { NotificationsPage } from './pages/common/NotificationsPage';

// Phase 2: GIS Parcel Intelligence & Parcel 360 Pages
import { GISExplorer } from './pages/GISExplorer';
import { Parcel360 } from './pages/Parcel360';

// Phase 4: Document Intelligence & OCR Verification Pages
import { CitizenDocuments } from './pages/citizen/CitizenDocuments';
import { OfficerDocumentReview } from './pages/officer/OfficerDocumentReview';

// Phase 6: Land DNA & Intelligent Risk Detection Pages
import { LandDNAProfile } from './pages/officer/LandDNAProfile';
import { OfficerRiskDashboard } from './pages/officer/OfficerRiskDashboard';
import { OfficerAnomalyReview } from './pages/officer/OfficerAnomalyReview';
import { AdminLandIntelligence } from './pages/admin/AdminLandIntelligence';
import { CitizenLandStatus } from './pages/citizen/CitizenLandStatus';

// Phase 7: Land Interoperability & Digital Public Infrastructure (DPI) Pages
import { DepartmentIntegrationCenter } from './pages/admin/DepartmentIntegrationCenter';
import { OfficerDataAccess } from './pages/officer/OfficerDataAccess';
import { CitizenDataSharing } from './pages/citizen/CitizenDataSharing';

// Phase 8: Spatial Intelligence & Multi-Layer GIS Dashboard
import { SpatialAnalyticsDashboard } from './pages/admin/SpatialAnalyticsDashboard';

// Phase 9: Civic, Fiscal & Infrastructure Integration Pages
import { CivicServicesManager } from './pages/officer/CivicServicesManager';

// Phase 10: National Scalability & State Configuration Engine Pages
import { StateConfigurationPage } from './pages/StateConfigurationPage';
import { StateComparisonPage } from './pages/StateComparisonPage';
import { StateOnboardingPage } from './pages/StateOnboardingPage';

// Phase 10.5: Final Governance, Admin Operations & AI Intelligence Hub
import { AdminSystemHub } from './pages/admin/AdminSystemHub';
import { AdminUsersRoles } from './pages/admin/AdminUsersRoles';
import { AdminConfiguration } from './pages/admin/AdminConfiguration';
import { AdminAuditLogs } from './pages/admin/AdminAuditLogs';
import { AdminDataQuality } from './pages/admin/AdminDataQuality';
import { AdminSecurityDashboard } from './pages/admin/AdminSecurityDashboard';
import { AdvancedLandAnalytics } from './pages/admin/AdvancedLandAnalytics';
import { OpenDataExplorer } from './pages/OpenDataExplorer';
import { CitizenAssistantPage } from './pages/citizen/CitizenAssistantPage';
import { CitizenGuidedJourney } from './pages/citizen/CitizenGuidedJourney';
import { DashboardsHubPage } from './pages/DashboardsHubPage';

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            {/* Protected Routes Base */}
            <Route element={<ProtectedRoute />}>
              {/* Central Dashboards Directory Hub */}
              <Route path="/dashboards" element={<DashboardLayout />}>
                <Route index element={<DashboardsHubPage />} />
              </Route>
              <Route path="/hubs" element={<DashboardLayout />}>
                <Route index element={<DashboardsHubPage />} />
              </Route>

              {/* Direct Shared Routes within Dashboard Layout */}
              <Route path="/gis" element={<DashboardLayout />}>
                <Route index element={<GISExplorer />} />
              </Route>
              <Route path="/gis/open-data" element={<DashboardLayout />}>
                <Route index element={<OpenDataExplorer />} />
              </Route>
              <Route path="/parcel/:parcelId" element={<DashboardLayout />}>
                <Route index element={<Parcel360 />} />
              </Route>
              <Route path="/assistant" element={<DashboardLayout />}>
                <Route index element={<CitizenAssistantPage />} />
              </Route>
              <Route path="/analytics/maps" element={<DashboardLayout />}>
                <Route index element={<AdvancedLandAnalytics />} />
              </Route>

              {/* Citizen Portal */}
              <Route element={<RoleProtectedRoute allowedRoles={['citizen', 'admin']} />}>
                <Route path="/citizen" element={<DashboardLayout />}>
                  <Route index element={<Navigate to="/citizen/dashboard" replace />} />
                  <Route path="dashboard" element={<CitizenDashboard />} />
                  <Route path="guided-journey" element={<CitizenGuidedJourney />} />
                  <Route path="assistant" element={<CitizenAssistantPage />} />
                  <Route path="gis" element={<GISExplorer />} />
                  <Route path="open-data" element={<OpenDataExplorer />} />
                  <Route path="status" element={<CitizenLandStatus />} />
                  <Route path="documents" element={<CitizenDocuments />} />
                  <Route path="verify" element={<CitizenDocuments />} />
                  <Route path="data-sharing" element={<CitizenDataSharing />} />
                  <Route path="records" element={<CitizenLandRecords />} />
                  <Route path="applications" element={<MyApplications />} />
                  <Route path="create-request" element={<CreateRequest />} />
                  <Route path="create" element={<CreateRequest />} />
                  <Route path="notifications" element={<NotificationsPage />} />
                  <Route path="profile" element={<ProfilePage />} />
                </Route>
              </Route>

              {/* Officer Console */}
              <Route element={<RoleProtectedRoute allowedRoles={['officer', 'admin']} />}>
                <Route path="/officer" element={<DashboardLayout />}>
                  <Route index element={<Navigate to="/officer/dashboard" replace />} />
                  <Route path="dashboard" element={<OfficerDashboard />} />
                  <Route path="gis" element={<GISExplorer />} />
                  <Route path="open-data" element={<OpenDataExplorer />} />
                  <Route path="analytics-maps" element={<AdvancedLandAnalytics />} />
                  <Route path="state-configuration" element={<StateConfigurationPage />} />
                  <Route path="spatial-analytics" element={<SpatialAnalyticsDashboard />} />
                  <Route path="civic-services" element={<CivicServicesManager />} />
                  <Route path="land-dna" element={<LandDNAProfile />} />
                  <Route path="land-dna/:parcelId" element={<LandDNAProfile />} />
                  <Route path="data-access" element={<OfficerDataAccess />} />
                  <Route path="risk-dashboard" element={<OfficerRiskDashboard />} />
                  <Route path="anomalies" element={<OfficerAnomalyReview />} />
                  <Route path="documents" element={<OfficerDocumentReview />} />
                  <Route path="queue" element={<ReviewQueue />} />
                  <Route path="cases" element={<OfficerVerificationCases />} />
                  <Route path="verification" element={<OfficerVerificationCases />} />
                  <Route path="search" element={<GISExplorer />} />
                  <Route path="notifications" element={<NotificationsPage />} />
                  <Route path="profile" element={<ProfilePage />} />
                </Route>
              </Route>

              {/* Admin System */}
              <Route element={<RoleProtectedRoute allowedRoles={['admin']} />}>
                <Route path="/admin" element={<DashboardLayout />}>
                  <Route index element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="system-hub" element={<AdminSystemHub />} />
                  <Route path="system" element={<AdminSystemHub />} />
                  <Route path="monitoring" element={<AdminSystemHub />} />
                  <Route path="users-roles" element={<AdminUsersRoles />} />
                  <Route path="users" element={<AdminUsersRoles />} />
                  <Route path="configuration" element={<AdminConfiguration />} />
                  <Route path="audit-logs" element={<AdminAuditLogs />} />
                  <Route path="audit" element={<AdminAuditLogs />} />
                  <Route path="data-quality" element={<AdminDataQuality />} />
                  <Route path="security" element={<AdminSecurityDashboard />} />
                  <Route path="compliance" element={<AdminSecurityDashboard />} />
                  <Route path="state-configuration" element={<StateConfigurationPage />} />
                  <Route path="state-comparison" element={<StateComparisonPage />} />
                  <Route path="state-onboarding" element={<StateOnboardingPage />} />
                  <Route path="spatial-analytics" element={<SpatialAnalyticsDashboard />} />
                  <Route path="civic-services" element={<CivicServicesManager />} />
                  <Route path="integrations" element={<DepartmentIntegrationCenter />} />
                  <Route path="land-intelligence" element={<AdminLandIntelligence />} />
                  <Route path="analytics" element={<AdminAnalytics />} />
                  <Route path="analytics-maps" element={<AdvancedLandAnalytics />} />
                  <Route path="documents" element={<OfficerDocumentReview />} />
                  <Route path="gis" element={<GISExplorer />} />
                  <Route path="settings" element={<ProfilePage />} />
                </Route>
              </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </LanguageProvider>
    </AuthProvider>
  );
}
