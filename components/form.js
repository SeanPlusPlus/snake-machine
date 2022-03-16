import Link from 'next/link'

const Form = ({ isLogin, errorMessage, onSubmit }) => (
  <div className="card w-96 bg-base-100 shadow-xl">
    <form onSubmit={onSubmit}>
      <div className="card-body">

        <div className="form-control w-full max-w-xs">
          <label className="label">
            <span className="label-text">Username</span>
          </label>
          <input name="username" type="text" className="input input-bordered w-full max-w-xs" />
        </div>


        <div className="form-control w-full max-w-xs">
          <label className="label">
            <span className="label-text">Password</span>
          </label>
          <input name="password" type="text" className="input input-bordered w-full max-w-xs" autoComplete="off" />
        </div>

        {!isLogin && (
          <div className="form-control w-full max-w-xs">
            <label className="label">
              <span className="label-text">Password</span>
            </label>
            <input name="rpassword" type="text" className="input input-bordered w-full max-w-xs" autoComplete="off" />
          </div>
        )}

        <div className="submit">
          {isLogin ? (
            <>
              <div className="mb-5">
                <Link href="/signup">
                  <a className="link link-secondary">I don't have an account</a>
                </Link>
              </div>
              <div className="card-actions justify-end">
                <button type="submit" className="btn btn-outline">Login</button>
              </div>
            </>
          ) : (
            <>
              <div className="mb-5">
                <Link href="/login">
                  <a className="link link-secondary">I already have an account</a>
                </Link>
              </div>
              <div className="card-actions justify-end">
                <button type="submit" className="btn btn-outline">Signup</button>
              </div>
            </>
          )}
        </div>
        {errorMessage && <p className="error">{errorMessage}</p>}
      </div>
    </form>
  </div>
)

export default Form
