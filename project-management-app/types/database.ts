export interface AppUser {
    email: string
    firstname: string
    lastname: string
    isactive?: boolean
    joinedat: string
}

export interface Project {
    projectid: number
    title: string
    description: string
    projectstatus: string
    pricingtypeid: number
    startdate?: string
    enddate?: string
    percentcompleted?: number
    totalbudget?: number
    targetmargin?: number
    accountmanageremail: string
    deliverymanageremail: string
    createdbyemail: string
    createdon: string
    updatedbyemail?: string
    updatedon?: string
    clientid?: number
    client?: Client // Optional relation
    timingstatus?: string
    timingjustification?: string
    budgetstatus?: string
    budgetjustification?: string
    scopestatus?: string
    scopejustification?: string
}

export interface Client {
    id: number
    name: string
    description?: string
    created_at?: string
    created_by?: string
    projects?: Project[]
}

export interface TimeSheet {
    timesheetid: number
    projectid: number
    month: number
    year: number
    workload: number
    externaldevcount: number
    brandeddevyearscount: number
    totalmancount?: number
    totalsubtractvalue?: number
    createdat?: string
    estworkload?: number
    useremail?: string
    roleid?: number
}

export interface Risk {
    riskid: number
    projectid: number
    title: string
    description: string
    importance: string
    status: string
    ownermail?: string
    createdat: string
    createdbbyemail: string
    regulation?: string
}

export interface Deliverable {
    deliverableid: number
    projectid: number
    title: string
    description: string
    duedate?: string
    status: string
    createdat: string
}

export interface Achievement {
    achievementid: number
    projectid: number
    title: string
    description: string
    dateachieved: string
    regulation?: string
    createdat: string
}

export interface Registration {
    regid: number
    projectid: number
    email: string
    roleid: number
}

export interface Role {
    roleid: number
    name: string
    description: string
    defaulthourlyrate?: number
}

export interface Note {
    noteid: number
    rank: string
    description: string
    defaulthourlyrate?: number
}

export interface PriceType {
    pricingtypeid: number
    name: string
    description: string
}

export interface RagStatus {
    ragid: number
    projectid: number
    timing: string
    budget: string
    scope: string
    justificationtiming: string
    justificationbudget: string
    justificationscope: string
    createdbyemail: string
    createdon: string
}
