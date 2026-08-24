import style from './LoginPage.module.css';

function LoginPage(){
    return(
        <>
            <div className={style.container}>
                <div className={style.containerLeft}>
                    <div className={style.containerLeftHeader}>
                        <h1>Good food is just <span>one tap away.</span></h1>
                        <p>Sign to discover Stores, Foods, track your orders and enjoy exclusive deals.</p>
                        <div className={style.loginGoogle}></div>
                        <h4>Or login with email</h4>
                    </div>
                    <div className={style.containerLeftForm}>
                        <form>
                            <div className={style.formEmail}></div>
                            <div className={style.formPassword}></div>
                            <div className={style.formRemember}></div>
                            <div className={style.formButton}></div>
                        </form>
                    </div>
                    <div className={style.containerLeftRegister}>
                        <p>New to Buy2Eat? <span>Create an account</span></p>
                    </div>
                </div>
                <div className={style.containerRight}>
                    <div className={style.containerRightImage}></div>
                </div>
            </div>
        </>
    )
}

export default LoginPage;