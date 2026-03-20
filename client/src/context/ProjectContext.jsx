import React, { createContext, useContext, useState } from 'react';

const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
    const [activeProject, setActiveProject] = useState(null);
    return (
        <ProjectContext.Provider value={{ activeProject, setActiveProject }}>
            {children}
        </ProjectContext.Provider>
    );
};

export const useProject = () => useContext(ProjectContext);
