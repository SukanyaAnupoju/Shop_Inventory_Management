import React, { useState } from 'react';
import { setloginStatus } from "../../Redux/login/isLogin";
import { useDispatch } from 'react-redux';
import baseurl from '../../utils/baseurl';
import { useForm } from 'react-hook-form';
import { EnvelopeIcon, EyeIcon, EyeSlashIcon, KeyIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

const Auth = () => {
    const [isLoginPage, setisLoginPage] = useState(true);
    const [eyePassword, seteyePassword] = useState(false);
    const [eyeConfirmPassword, seteyeConfirmPassword] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { register, handleSubmit, formState: { errors }, watch, reset } = useForm();

    // Form validation helpers
    const validateEmail = (email) => {
        if (!email.match(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/)) {
            return "Invalid email format";
        }
    };
    const validatePassword = (password) => {
        let regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\[\]{};':",.<>/?])(?!.*\s).{8,}$/g;
        if (!password.match(regex)) {
            return "Password must be 8+ chars with uppercase, lowercase, number, and special character.";
        }
    };

    // API call: Login
    const loginUser = async (obj) => {
        try {
            const res = await fetch(`${baseurl}/login`, {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(obj),
                credentials: 'include'
            });
            const result = await res.json();
            if (result.status) {
                dispatch(setloginStatus(true));
                toast.success(result.message || "Login success");
                setTimeout(() => navigate("/"), 1500);
            } else {
                toast.error(result.message || "Invalid credentials");
                console.error('Login Error:', result.message);
            }
        } catch (error) {
            toast.error("Network error! Try again");
            console.error('Error::Auth::loginUser', error);
        }
    };

    // API call: Register
    const registerUser = async (obj) => {
        try {
            const res = await fetch(`${baseurl}/register`, {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(obj),
                credentials: 'include'
            });
            const result = await res.json();
            if (result.status) {
                toast.success(result.message || "Registration success! Login now");
                setisLoginPage(true);
            } else {
                toast.error(result.message || "Registration failed");
                console.error('Register Error:', result.message);
            }
        } catch (error) {
            toast.error("Network error! Try again");
            console.error('Error::Auth::registerUser', error);
        }
    };

    // Form submit handler
    const onSubmit = (data) => {
        if (data.btnOption === "REGISTER") {
            if (data.password !== data.cpassword) {
                toast.error("Passwords do not match");
                return;
            }
            registerUser(data);
        } else {
            loginUser(data);
        }
    };

    return (
        <main className='px-4 md:w-2/3 md:mx-auto'>
            <div className="h2 text-center text-xl font-bold">
                {isLoginPage ? "Login into Account" : "Register Account"}
            </div>
            <div className='flex justify-center mx-auto mt-4'>
                <form onSubmit={handleSubmit(onSubmit)} className='w-full lg:max-w-xs' autoComplete='off' noValidate>
                    {/* Email */}
                    <label className={`input input-bordered flex items-center gap-2 rounded-lg ${errors.email ? "input-error" : "input-success"}`}>
                        <EnvelopeIcon className="h-4 w-4 opacity-70" />
                        <input
                            type="text"
                            {...register('email', { validate: validateEmail })}
                            className="grow bg-transparent"
                            placeholder="Email"
                        />
                    </label>
                    {errors.email && <p className="label-text text-xs text-error h-8 pt-2">{errors.email.message}</p>}

                    {/* Password */}
                    <label className={`input input-bordered flex items-center gap-2 rounded-lg ${errors.password ? "input-error" : "input-success"}`}>
                        <KeyIcon className="h-4 w-4 opacity-70" />
                        <input
                            type={eyePassword ? "text" : "password"}
                            {...register('password', { validate: validatePassword })}
                            className="grow bg-transparent"
                            placeholder="Password"
                        />
                        {eyePassword
                            ? <EyeSlashIcon className="h-4 w-4 opacity-70 cursor-pointer" onClick={() => seteyePassword(false)} />
                            : <EyeIcon className="h-4 w-4 opacity-70 cursor-pointer" onClick={() => seteyePassword(true)} />}
                    </label>
                    {errors.password && <p className="label-text text-xs text-error h-8 pt-2">{errors.password.message}</p>}
                    <div className="label">
                        <span className="label-text text-xs text-gray-500">Min 8 chars with uppercase, lowercase, number & special character.</span>
                    </div>

                    {/* Confirm Password (only on register) */}
                    {!isLoginPage && (
                        <>
                            <label className={`input input-bordered flex items-center gap-2 rounded-lg ${errors.cpassword ? "input-error" : "input-success"}`}>
                                <KeyIcon className="h-4 w-4 opacity-70" />
                                <input
                                    type={eyeConfirmPassword ? "text" : "password"}
                                    {...register('cpassword', { validate: validatePassword })}
                                    className="grow bg-transparent"
                                    placeholder="Confirm password"
                                />
                                {eyeConfirmPassword
                                    ? <EyeSlashIcon className="h-4 w-4 opacity-70 cursor-pointer" onClick={() => seteyeConfirmPassword(false)} />
                                    : <EyeIcon className="h-4 w-4 opacity-70 cursor-pointer" onClick={() => seteyeConfirmPassword(true)} />}
                            </label>
                            {errors.cpassword && <p className="label-text text-xs text-error h-8 pt-2">{errors.cpassword.message}</p>}
                        </>
                    )}

                    <input type="hidden" {...register('btnOption')} id='btnHiddenForm' />

                    {/* Submit Button */}
                    {isLoginPage
                        ? <input type="submit" className='btn w-full lg:max-w-xs btn-primary mt-4' value="Login" onClick={() => reset({ btnOption: "LOGIN" })} />
                        : <input type="submit" className='btn w-full lg:max-w-xs btn-primary mt-4' value="Register" onClick={() => reset({ btnOption: "REGISTER" })} />}
                </form>
            </div>

            {/* Switch between login/register */}
            <div className="more text-center mt-4">
                <h5>OR</h5>
                {isLoginPage
                    ? <div>Do not have an account? <span className='underline cursor-pointer' onClick={() => setisLoginPage(false)}>Register</span></div>
                    : <div>Already have an account? <span className='underline cursor-pointer' onClick={() => setisLoginPage(true)}>Login</span></div>}
            </div>

            <Toaster />
        </main>
    );
};

export default Auth;
