import * as Icons from "react-icons/vsc";
import { useDispatch } from "react-redux";
import { NavLink } from "react-router-dom";
import { closeDashboard } from "../slices/authSlice";

export default function SidebarLink({ link, iconName }) {
  const Icon = Icons[iconName];
  const dispatch = useDispatch();

  return (
    <NavLink
      to={link.path}
      end={link.path === "/dashboard"}
      onClick={() => dispatch(closeDashboard())}
      className={({ isActive }) =>
        `relative px-8 py-2 text-sm font-medium ${
          isActive ? "bg-yellow-800 text-yellow-50" : "bg-opacity-0 text-richblack-300"
        } transition-all duration-200`
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={`absolute left-0 top-0 h-full w-[0.15rem] bg-yellow-50 ${
              isActive ? "opacity-100" : "opacity-0"
            }`}
          ></span>
          <div className="flex items-center gap-x-2">
            {Icon ? <Icon className="text-lg" /> : null}
            <span>{link.name}</span>
          </div>
        </>
      )}
    </NavLink>
  );
}
