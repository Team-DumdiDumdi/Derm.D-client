import React, { useState, useEffect } from "react";
import Header from "../components/Header"
import Popup from '../components/Popup'
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Carousel from 'react-bootstrap/Carousel';
import Button from '@mui/material/Button';
import ReactButton from 'react-bootstrap/Button'
import TextField from '@mui/material/TextField';
import styled from "styled-components";
import {Link, useParams, useNavigate} from "react-router-dom";
import {Formik } from "formik";
import BootstrapForm from "react-bootstrap/Form";
import axios from 'axios'

const MaterialForm = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100vw;
    height: 100vh;
`;

const Formquestion = styled.form`
    display: flex;
    flex-direction: column;
    background-color: white;
    padding: 32px;
    min-width: 1000px;
    border-radius: 8px;
    margin: 10px;
`;


export default function Question(){
    const useGetData = () => {
        const [popup, setPopup] = useState({open: false, title: "", message: "", callback: false});
        const [fileImage, setFileImage] = useState("");
        const [imagedummy, setimagedummy] = useState([]);
        const [content, setContent] = useState('');
        const {diseaseid, qnaid} = useParams();
        const postfile = new Array();
        const formData = new FormData();
        const navigate = useNavigate();

        const saveFileImage  = (event) => {
            const nowSelectImageList = event.target.files;
            const nowImageURLList = [...fileImage];

            for(let i=0; i< nowSelectImageList.length; i++){
                const nowImageUrl = URL.createObjectURL(nowSelectImageList[i]);
                nowImageURLList.push(nowImageUrl);
                setimagedummy(event.target.files[i]);
                //postfile.push(event.target.files[i]);
            }

            if(nowImageURLList.length > 10){
                nowImageURLList = nowImageURLList.slice(0,10);
            }

            setFileImage(nowImageURLList);
            console.log(event.target.files);
            console.log(postfile.size);
            //setimagedummy([...imagedummy,postfile]);
            //setimagedummy(event.target.files[0]);
        };
    
        const deleteFileImage = () => {
            URL.revokeObjectURL(fileImage);
            setFileImage('');
            setimagedummy(null);
            //postfile.clear();
        };

        const onContentHandler = (event) => {
            setContent(event.target.value);
        }

        const onSubmit = (event) => {
            event.preventDefault();
            console.log(imagedummy);
            
            formData.append('media', imagedummy);

            formData.append('content', content);
          
            if(!(content)){
                setPopup({open: true, title: "에러!", message: "내용을 입력해 주세요!"});
            }
            else if(qnaid){
                modifyQuestion();
            }
            else {
                postQuestion();
            }
        }

        const postQuestion= async () => {
            for (const keyValue of formData) console.log(keyValue);

            const postUrl = `/condition/${diseaseid}/question`;
            await axios.post(postUrl, formData,{
              headers:{
                  'Content-Type' : 'multipart/form-data'
                }
            })
            .then((response) => {
                setPopup({open: true, title: "성공!", message: "질문이 작성 되었습니다!", callback: function(){
                    navigate(`/infodisease/${diseaseid}`,{replace:true});
                  }}); 
                  console.log("질문 작성 성공");              
            }).catch(function(error){
                console.log(error);
            });
        }
        
        const modifyQuestion = async () => {
            const postUrl = `/condition/${diseaseid}/question/${qnaid}`;

            await axios.put(postUrl, formData,{
                headers:{
                    'Content-Type' : 'multipart/form-data'
                  }
              })
            .then((response) => {
              setPopup({open: true, title: "성공!", message: "질문이 수정 되었습니다!", callback: function(){
                navigate(`/infodisease/${diseaseid}/qna/${qnaid}`,{replace:true});
              }}); 
              console.log("질문 수정 성공");
            }).catch(function(error){
              setPopup({open: true, title: "실패!", message: "당신은 질문 작성자가 아닙니다!", callback: function(){
                  navigate(`/infodisease/${diseaseid}/qna/${qnaid}`,{replace:true});
                }}); 
                console.log("질문 수정 실패");
              console.log(error);
            });
          }

        return {
            popup,
            setPopup,
            onSubmit,
            saveFileImage,
            deleteFileImage,
            onContentHandler,
            fileImage,
            diseaseid,
            qnaid,
        }
    }

    const { popup, setPopup, onSubmit, saveFileImage, deleteFileImage, onContentHandler, fileImage, diseaseid, qnaid } = useGetData();

    return (
        <MaterialForm>
            <Popup open = {popup.open} setPopup = {setPopup} title = {popup.title} message = {popup.message} callback = {popup.callback}/>            
            <Header/>

            <Typography variant="h2" gutterBottom component="div" align="center" style={{ textDecoration: 'none', color:'#168d63' }}>
              증상 질문
            </Typography>

            <Formik>
            {() => (
                <Paper elevation={6}>
                    <Formquestion noValidate onSubmit={onSubmit}>
                        <Box height={20} />
                        <TextField
                            id="filled-multiline-static"
                            label="질문 내용"
                            multiline
                            minRows={20}
                            placeholder="질문하고 싶은 질환에 대해 적으세요."
                            variant="filled"
                            inputProps={{style: {fontSize: 20}}} 
                            InputLabelProps={{style: {fontSize: 20}}} 
                            onChange={onContentHandler}
                        />
                        <Box height={20} />
                            <Grid item xs={12} >
                                <BootstrapForm.Group controlId="formFileLg" className="mb-3">
                                    <BootstrapForm.Label style={{fontSize: "30px"}}>(선택사항) 참고 사진을 선택하세요</BootstrapForm.Label>
                                    <Grid container spacing={2}>
                                        <Grid item xs={9} >
                                            { fileImage ? 
                                            (
                                                <Typography variant="h4" gutterBottom component="div" align="left" style={{ textDecoration: 'none', color:'#168d63' }}>
                                                    삭제를 누르셔야 다시 사진을 올리실 수 있습니다.
                                                </Typography>
                                            )
                                            : 
                                                <BootstrapForm.Control type="file" multiple size="lg" name="media" accept="image/*" onChange={saveFileImage}/>
                                            }
                                        </Grid>   
                                        <Grid item xs={3} >
                                            <ReactButton
                                                style={{fontSize: "20px", textTransform: "none", padding: "10px 20px" }}
                                                variant="secondary" 
                                                onClick={() => deleteFileImage()}>
                                                삭제
                                            </ReactButton>
                                        </Grid>     
                                    </Grid>
                                </BootstrapForm.Group>
                            </Grid>
                        <Box width="50%" height="40%" >
                            {fileImage ? 
                            (
                                <Carousel>
                                    {fileImage && fileImage.map((imageitem) => (
                                    <Carousel.Item>
                                        <img
                                        className="d-block w-100"
                                        src={imageitem}
                                        width="400px"
                                        height="400px"
                                        />
                                    </Carousel.Item>
                                    ))}
                                </Carousel>
                            )
                            : 
                            <br/> 
                            }
                            {/* {fileImage ? <img className="referenceImage" alt="referenceImage" src={fileImage} width="50%" height="50%"/> : <br/>} */}
                        </Box>           
                        
                        <Box height={30} />
                        { qnaid ? 
                        (                          
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Button style={{fontSize: "20px"}} type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} size="large" color = "success">
                                        질문 수정 완료!
                                    </Button>
                                </Grid>
                                <Grid item xs={6}>
                                    <Link to={`/infodisease/${diseaseid}`} style={{ textDecoration: 'none' }}>
                                        <Button style={{fontSize: "20px"}} fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} size="large" color = "error">
                                          질문 수정 취소
                                        </Button>
                                    </Link>
                                </Grid>
                            </Grid>                            
                        )
                        :
                        (
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Button style={{fontSize: "20px"}} type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} size="large" color = "success">
                                        작성 완료!
                                    </Button>
                                </Grid>
                                <Grid item xs={6}>
                                    <Link to={`/infodisease/${diseaseid}`} style={{ textDecoration: 'none' }}>
                                        <Button style={{fontSize: "20px"}} fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} size="large" color = "error">
                                            작성 취소
                                        </Button>
                                    </Link>
                                </Grid>
                            </Grid>
                        )
                        }
                    </Formquestion>
                </Paper>
            )}
            </Formik>
      </MaterialForm>
    );
}