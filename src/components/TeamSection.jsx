import { FaLinkedin, FaGraduationCap } from "react-icons/fa";
import muzamil from "../assets/muzamil.png";



const teamMembers = [
    {
        name: "Muzamil Kehar",
        education: "BS Computer Science - SAUS",
        description: "Full Stack Developer responsible for frontend architecture, React.js development.",
        linkedin: "https://www.linkedin.com/in/muzamil-kehar2004/",
        image: muzamil,
        initials: "MK",
        color: "from-primary-400 to-primary-600",
    },

    {
        name: "Muhammad  Kaif",
        education: "BS Computer Science - SAUS",
        description: "Backend Engineer responsible for developing secure APIs, database infrastructure, and backend services.",
        linkedin: "https://www.linkedin.com/in/kaif-sasoli-308521204?utm_source=share_via&utm_content=profile&utm_medium=member_android",
        image: null,
        initials: "MK",
        color: "from-primary-400 to-primary-600",
    },

    {
        name: "Bakhtawar Mughal",
        education: "BS Computer Science - SAUS",
        description: "IoT & Embedded Systems Engineer responsible for integrating sensors, microcontrollers .",
        linkedin: "https://www.linkedin.com/in/bakhtawar-mughal-679532291?utm_source=share_via&utm_content=profile&utm_medium=member_android",
        image: null,
        initials: "BM",
        color: "from-primary-400 to-primary-600",
    },

    {
        name: "Maria Sony",
        education: "BS Computer Science - SAUS",
        description: "AI/ML Engineer responsible for designing, training, and optimizing ML & DL models.",
        linkedin: "https://www.linkedin.com/in/maria-dahar-bb8b9a373/",
        image: null,
        initials: "MS",
        color: "from-primary-400 to-primary-600",
    },

    

    
]




const TeamSection = () => {

    return(
        <section id="team" className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Section Header */}

                <div className="text-center mb-16">
                    <span className="text-primary-600 font-semibold text-sm uppercase tracking-widest">
                    Meet The Team
                    </span>
                
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mt-2 mb-4">
                    The People Behind It
                </h2>
                <p className="text-gray-500 max-w-2xl mx-auto text-base">
                    A passionate team of students combining technology and agriculture to build
                    smarter farming solutions.
                </p>

                <div className="w-16 h-1 bg-primary-500 mx-auto mt-6 rounded-full" /> 
                </div>


                {/*Team Cards */}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {teamMembers.map((member) =>(

                        <div 
                        key={member.name}
                        className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-xl
                        transition-all duration-300 hover:-translate-y-1 text-center group"
                    >

                    {/* Profile Pictures */}
                    

                    <div className="relative mx-auto w-24 h-24 mb-4">

                        {member.image ? ( 
                       <img 
                       src={member.image}
                       alt={member.name} 
                       onError={(e) =>{
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                       }}
                       className="w-26 h-26 rounded-full bg-gradient-to-br shadow-lg  ring-4 ring-primary-100
                       group-hover:ring-primary-300 transition-all duration-300"
                       />
                        ): null}

                       <div 
                        style={{display: member.image ? "none": "flex"}}
                       className={`w-24 h-24 rounded-full bg-gradient-to-br ${member.color} flex items-center
                       justify-center shadow-lg ring-4 ring-primary-100 grouph-hover:ring-primary-300 
                       transition-all duration-300`}
                        >

                        <span className="text-white font-bold text-2xl">
                            {member.initials}
                        </span>
                        </div>
                     </div>
                        
                    {/*Name */}

                    <h3 className="text-gray-800 font-bold text-base mb-1">
                        {member.name}
                    </h3>

                    {/*Name */}

                    <div className="flex items-center justify-center gap-1 mb-3">
                        <FaGraduationCap className="text-primary-500 text-sm"/>
                        <p className="text-primary-600 text-xs font-medium">
                        {member.education}
                        </p>
                    </div>

                    {/* Description */}

                    <p className="text-gray-600 text-sm leading-relaxed mb-5">
                        {member.description}
                    </p>

                    {/* LinkedIn Button */}

                    <a 
                    href={member.linkedin}
                    target="_Blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-700 
                    text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                    >
                    <FaLinkedin className="text-base"/>
                    LinkedIn
                    </a>
                      </div>  
                    ))}

                </div>
            </div>  
        </section>
    );
};

export default TeamSection;