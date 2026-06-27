//* src/routes/AppRoutes.tsx

import { Routes, Route } from "react-router";

import ROUTES from "@/routes/paths";
import GuestRoute from "@/routes/GuestRoute";
import ProtectedRoute from "@/routes/ProtectedRoute";
import AdminRoute from "@/routes/AdminRoute";

import AdminLayout from "@/components/layout/AdminLayout";

import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import DashboardPage from "@/pages/DashboardPage";

import OverviewPage from "@/pages/admin/OverviewPage";
import CoursesPage from "@/pages/admin/CoursesPage";
import CourseFormPage from "@/pages/admin/CourseFormPage";
import CurriculumPage from "@/pages/admin/CurriculumPage";
import StudentsPage from "@/pages/admin/StudentsPage";
import StudentManagePage from "@/pages/admin/StudentManagePage";
import EnrollmentsPage from "@/pages/admin/EnrollmentsPage";

/** Central route definitions with auth guards. */
const AppRoutes = () => {
	return (
		<Routes>
			<Route path={ROUTES.ROOT} element={<HomePage />} />

			{/* Logged-out only */}
			<Route element={<GuestRoute />}>
				<Route path={ROUTES.LOGIN} element={<LoginPage />} />
				<Route path={ROUTES.REGISTER} element={<RegisterPage />} />
			</Route>

			{/* Authenticated */}
			<Route element={<ProtectedRoute />}>
				<Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />

				{/* Admin only */}
				<Route element={<AdminRoute />}>
					<Route path={ROUTES.ADMIN} element={<AdminLayout />}>
						<Route index element={<OverviewPage />} />
						<Route path="courses" element={<CoursesPage />} />
						<Route path="courses/new" element={<CourseFormPage />} />
						<Route path="courses/:id/edit" element={<CourseFormPage />} />
						<Route path="courses/:id/curriculum" element={<CurriculumPage />} />
						<Route path="students" element={<StudentsPage />} />
						<Route path="students/:id" element={<StudentManagePage />} />
						<Route path="enrollments" element={<EnrollmentsPage />} />
					</Route>
				</Route>
			</Route>
		</Routes>
	);
};

export default AppRoutes;
