import { Outlet, useNavigate } from "react-router";
import { NavLink } from "react-router";
import { curPatternAtom, drawingDataAtom } from "../utils/atoms";
import { useAtom } from "jotai";

function Layout() {
  const [curPattern, setCurPattern] = useAtom(curPatternAtom);
  const [canvasData, setCanvasData] = useAtom(drawingDataAtom);
  const navigate = useNavigate();

  const handleReset = () => {
    setCurPattern(null);
    setCanvasData("");
    navigate("/");
  };

  return (
    <>
      <nav className="fixed top-0 left-0 z-10 w-full border-b border-white/50 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between p-4">
          <div className="text-3xl font-bold text-gray-800">
            Sarong Designer
          </div>
          <div className="flex items-center gap-4">
            <ul className="flex flex-wrap gap-3">
              <li>
                <NavLinkWrapper to="/">Choose</NavLinkWrapper>
              </li>
              <li>
                <NavLinkWrapper to="/draw" disabled={!curPattern}>
                  Draw
                </NavLinkWrapper>
              </li>
              <li>
                <NavLinkWrapper
                  to="/preview"
                  disabled={!canvasData || !curPattern}
                >
                  Preview
                </NavLinkWrapper>
              </li>
            </ul>
            <button
              onClick={handleReset}
              className="rounded-full bg-blue-700 px-4 py-2 text-sm font-semibold text-white shadow-md transition-all hover:bg-gray-800 hover:-translate-y-0.5 active:translate-y-0"
            >
              Reset
            </button>
          </div>
        </div>
      </nav>
      <main className="min-h-screen bg-gray-300 p-4 pt-24">
        <Outlet />
      </main>
    </>
  );
}

export default Layout;

interface Props {
  to: string;
  children: React.ReactNode;
  disabled?: boolean;
}

const NavLinkWrapper = ({ to, children, disabled }: Props) => {
  const linkBase =
    "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-pink-300/40 transition-all duration-300 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 hover:shadow-pink-400/60 hover:-translate-y-0.5 active:translate-y-0";

  if (disabled) {
    return (
      <span className={`${linkBase} cursor-not-allowed opacity-50`}>
        {children}
      </span>
    );
  }

  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `${linkBase} ${isActive ? "ring-4 ring-red-500/60" : ""}`
      }
    >
      {children}
    </NavLink>
  );
};
