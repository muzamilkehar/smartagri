import { useState } from "react";
import { FaEnvelope, FaPhoneAlt, FaMapMarkedAlt, FaPaperPlane } from "react-icons/fa";


const ContactSection = () => {
    
        const [formData, setFormData] = useState({
            fullname: "",
            email: "",
            subject: "",
            message: ""
        });

        const [errors, setErrors] = useState({});
        const [submitted, setSubmitted] = useState(false);


        const validate = () => {
            const newErrors = {};
            if(!formData.fullname.trim())
                newErrors.fullname = "Full Name is required";

            if(!formData.email.trim())
                newErrors.email = "Email is required."
            else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
                newErrors.email = "Please enter a valid email.";

            if(!formData.subject.trim())
                newErrors.subject = "Subject is required";

            if(!formData.message.trim())
                newErrors.message = "Message is required"
            else if(formData.message.trim().length <10)
                newErrors.message = "Message must be at least 10 characters";

            return newErrors;

        };


        const handleChange = (e) => {
            const {name, value} = e.target;
            setFormData((prev) => ({...prev, [name]: value}));
            if(errors[name]) {
                setErrors((prev) => ({...prev, [name]: ""}));
            }
        };

        const handleSubmit = (e) => {
            e.preventDefault();
            const validationErrors = validate();
            if(Object.keys(validationErrors).length > 0) {
                setErrors(validationErrors);
                return;
            }

            setSubmitted(true);
            setFormData({fullname:"", email:"", subject:"", message:""});
        }

        const inputClass = (field) => {
            return `w-full px-4 py-3 rounded-xl border text-sm text-gray-700 outline-none transition-all duration-300
            ${errors[field]
                ? "border-red-400 bg-red-50 focus:border-red-500"
                : "border-gray-200 bg-gray-50 focus:border-primary-500 focus:bg-white"
            }`;
        }
             

            return(
                <section id="contact" className="py-20 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">


                {/*Section Header */}

                <div className="text-center mb-16">
                    <span className="text-primary-600 font-semibold text-sm uppercase tracking-widest">
                        Get In Touch
                    </span>

                <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mt-2 mb-4">
                    Contact Us
                </h2>
                
                <p className="text-gray-500 max-w-2xl mx-auto text-base">
                    Have Questions About The Platform? We'd Love To Hear From You.
                </p>
                <div className="w-16 h-1 bg-primary-500 mx-auto mt-6 rounded-full" />
                </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
            {/* Contact Info */}
            <div className="space-y-6">
                {[
                    {
                        icon: <FaEnvelope className="text-primary-600 text-lg" />,
                        title: "Email Us",
                        value: "smartagri@gmail.com"
                    },

                    {
                        icon: <FaPhoneAlt className="text-primary-600 text-lg" />,
                        title: "Call Us",
                        value: "+92311234567"
                    },

                    {
                        icon: <FaMapMarkedAlt className="text-primary-600 text-lg" />,
                        title: "Location",
                        value: "Shikarpur Sindh, Pakistan"
                    },
                ].map((info) => (
                    <div 
                    key={info.title}
                    className="flex items-start gap-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100"
                    >
                        <div className="bg-primary-50 p-3 rounded-xl">
                            {info.icon}
                        </div>

                        <div>
                            <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">
                                {info.title}
                            </p>
                            <p className="text-gray-800 font-semibold text-sm mt-0.5">
                                {info.value}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Contact Info */}
            
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                { submitted ? (
                    <div className="flex flex-col items-center justify-center h-full py-12 text-center"> 
                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                        <FaPaperPlane className="text-primary-600 text-2xl"/>
                    </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                    Message Sent!
                </h3>

                <p className="text-gray-500 text-sm mb-6">
                    Thank you for reaching out. We'll get back to you soon.
                </p>

                <button
                    onClick={() => setSubmitted(false)}
                    className="bg-primary-600 text-white px-6 py-2 rounded-lg text-sm font-medium
                    hover:bg-primary-700 transition-colors"
                >
                    Send Another
                </button>                   
                    </div>
                ):(
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {/* Full Name */}

                        <div>
                            <label className="text-gray-700 text-sm font-medium mb-1.5 block">
                                Full Name
                            </label>
                            <input 
                            type="text"
                            name="fullname"
                            value={formData.fullname}
                            onChange={handleChange}
                            placeholder="John Doe"
                            className={inputClass("fullname")}
                            />

                            {errors.fullname && (
                                <p className="text-red-500 text-xs mt-1">{errors.fullname}</p>
                            )}
                       </div>

                       {/* Email */}

                       <div>
                        <label className="text-gray-700 text-sm font-medium mb-1.5 block">
                            Email Address
                        </label>

                        <input 
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="john@gmail.com"
                        className={inputClass("email")}
                        />

                        {errors.email && (
                            <p className="text-red-500 text-xs mt-1">
                                {errors.email}
                            </p>
                        )}
                       </div>
                        </div>

                    {/* Subject */}

                    <div>
                        <label className="text-gray-700 text-sm font-medium mb-1.5 block">
                            Subject
                        </label>

                        <input 
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="How we can help?"
                        className={inputClass("subject")} 
                        />

                        {errors.subject && (
                            <p className="text-red-500 text-xs mt-1">
                                {errors.subject}
                            </p>                            
                        )}                
                    </div>

                    {/* Message */}

                    <div>
                        <label className="text-gray-700 text-sm font-medium mb-1.5 block">
                            Message
                        </label>

                        <textarea 
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Write your message here..."
                        rows={5}
                        className={inputClass("message")} 
                        />
                        {errors.message && (
                            <p className="text-red-500 text-xs mt-1">
                                {errors.message}
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="flex w-full bg-primary-600 hover:bg-primary-700 text-white
                        py-3 rounded-xl font-semibold text-sm transition-all duration-200
                        items-center justify-center gap-2 hover:shadow-lg"
                    >

                        <FaPaperPlane className="text-sm"/>
                        Send Message
                    </button>
                    </form>

                )}
            </div>
        </div>
     </div>
</section>
    );};   

export default ContactSection;