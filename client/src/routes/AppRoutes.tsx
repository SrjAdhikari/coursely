//* src/routes/AppRoutes.tsx

import { Routes, Route } from "react-router";

import ROUTES from "@/routes/paths";
import GuestRoute from "@/routes/GuestRoute";
import ProtectedRoute from "@/routes/ProtectedRoute";
import AdminRoute from "@/routes/AdminRoute";

import AdminLayout from "@/components/layout/AdminLayout";
import StoreLayout from "@/components/layout/store/StoreLayout";
import HomeLayout from "@/components/layout/home/HomeLayout";
import AuthLayout from "@/components/layout/AuthLayout";

import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import DashboardPage from "@/pages/DashboardPage";
import CatalogPage from "@/pages/CatalogPage";
import CourseDetailPage from "@/pages/CourseDetailPage";
import PreviewPlayerPage from "@/pages/PreviewPlayerPage";
import CheckoutSuccessPage from "@/pages/CheckoutSuccessPage";
import CheckoutCancelPage from "@/pages/CheckoutCancelPage";
import MyCoursesPage from "@/pages/MyCoursesPage";
import LearnPage from "@/pages/LearnPage";
import NotFoundPage from "@/pages/NotFoundPage";

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
			<Route element={<HomeLayout />}>
				<Route path={ROUTES.ROOT} element={<HomePage />} />
				<Route path="*" element={<NotFoundPage />} />
			</Route>

			{/* Public storefront */}
			<Route element={<StoreLayout />}>
				<Route path={ROUTES.CATALOG} element={<CatalogPage />} />
				<Route path="/courses/:slug" element={<CourseDetailPage />} />
				<Route
					path="/courses/:slug/preview/:lessonId"
					element={<PreviewPlayerPage />}
				/>
			</Route>

			{/* Logged-out only */}
			<Route element={<GuestRoute />}>
				<Route element={<AuthLayout />}>
					<Route path={ROUTES.LOGIN} element={<LoginPage />} />
					<Route path={ROUTES.REGISTER} element={<RegisterPage />} />
				</Route>
			</Route>

			{/* Authenticated */}
			<Route element={<ProtectedRoute />}>
				{/* Learner watch page — full-bleed, not under StoreLayout */}
				<Route path="/learn/:courseSlug" element={<LearnPage />} />
				<Route path="/learn/:courseSlug/:lessonId" element={<LearnPage />} />

				{/* Protected storefront */}
				<Route element={<StoreLayout />}>
					<Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
					<Route
						path={ROUTES.CHECKOUT_SUCCESS}
						element={<CheckoutSuccessPage />}
					/>
					<Route
						path={ROUTES.CHECKOUT_CANCEL}
						element={<CheckoutCancelPage />}
					/>
					<Route path={ROUTES.MY_COURSES} element={<MyCoursesPage />} />
				</Route>

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
