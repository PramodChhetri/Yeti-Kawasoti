import axios from 'axios';
import AxiosDigestAuth from '@mhoc/axios-digest-auth';

interface MemberSetupData {
    id: string;
    name: string;
    gender: string;
    begin_date: string;
    expiry_date: string;
    photo_path: string;
}

interface MemberDeletedData {
    id: string;
}

interface PhotoUploadedData {
    id: string;
    photo_path: string;
}

const digestAuth = new AxiosDigestAuth({
    username: 'admin',
    password: 'Shass@2052'
});

export async function memberSetup(data: MemberSetupData) {
    return true;
    const payload = {
        UserInfo: {
            employeeNo: data.id,
            name: data.name,
            userType: 'normal',
            closeDelayEnabled: false,
            Valid: {
                enable: true,
                beginTime: data.begin_date,
                endTime: data.expiry_date,
                timeType: 'local'
            },
            belongGroup: '',
            password: '',
            doorRight: '1',
            RightPlan: [
                {
                    doorNo: 1,
                    planTemplateNo: '1'
                }
            ],
            gender: data.gender
        }
    };

    try {
        const response = await digestAuth.request({
            method: 'PUT',
            url: '/api/ISAPI/AccessControl/UserInfo/Setup?format=json',
            data: payload
        });
        console.log('Response:', response.data);

        await photoUploaded({ id: data.id, photo_path: data.photo_path });
    } catch (error: any) {
        console.error('Error setting up member:', error.message);
    }
}

export async function memberDeleted(data: MemberDeletedData) {
    return true;
    const payload = {
        UserInfoDelCond: {
            EmployeeNoList: [
                {
                    employeeNo: data.id
                }
            ],
            operateType: 'byTerminal',
            terminalNoList: [1]
        }
    };

    try {
        const response = await digestAuth.request({
            method: 'PUT',
            url: '/api/ISAPI/AccessControl/UserInfo/Delete?format=json',
            data: payload
        });
        console.log('Response:', response.data);
    } catch (error: any) {
        console.error('Error deleting member:', error.message);
    }
}

export async function photoUploaded(data: PhotoUploadedData) {
    return true;
    const url = "/api/ISAPI/Intelligent/FDLib/FaceDataRecord?format=json";

    try {
        const imageBlob = await fetch(data.photo_path).then(response => response.blob());

        const faceDataRecord = {
            FaceLibType: "blackFD",
            FDID: "1",
            FPID: data.id
        };

        const formData = new FormData();
        formData.append('facedatarecord', new Blob([JSON.stringify(faceDataRecord)], { type: 'application/json' }));
        formData.append('faceimage', imageBlob, 'face_image.jpg');

        const response = await digestAuth.request({
            method: 'POST',
            url: url,
            data: formData,
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        console.log('Response:', response.data);
    } catch (error: any) {
        console.error('Error uploading photo:', error.message);
    }
}

export async function checkAccessControlStatus() {
    return true;
    const url = 'http://192.168.1.3:80/ISAPI/System/deviceInfo?format=json&devIndex=B97D26B1-3815-40F2-8727-99E2678BF3C6';

    try {
        const response = await digestAuth.request({
            headers: { 
                Accept: "*/*",
            },
            method: 'GET',
            url: url,
        });
        return { status: true, data: response.data };
    } catch (error: any) {
        console.error('Error checking access control status:', error.message);
        return { status: false };
    }
}
