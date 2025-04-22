import { MembersGroupChat } from "@/constant/type";
import { Accordion, AccordionItem } from "@nextui-org/react";
import React, {Dispatch, useEffect, useRef, useState} from "react";

const roleLabel = {
  owner: "Trưởng nhóm",
  admin: "Phó nhóm",
  member: "",
};

interface ListMembersGroupChatProps {
  members: MembersGroupChat[];
  currentUserId: number;
  isConfirmation: Dispatch<any>
  currentChat: any;
  requestObject: Dispatch<any>;
}

const ListMembersGroupChat: React.FC<ListMembersGroupChatProps> = ({
  members,
  currentUserId,
  isConfirmation,
  currentChat,
  requestObject
}) => {
  const [memberAction, setMemberAction] = useState<number | null>(null);
  const yourRole = members.find(
    (member) => member.userId === currentUserId
  )?.role;
  const menuRef = useRef<HTMLDivElement | null>(null);

  const handleActionClick = (e: React.MouseEvent, userId: number) => {
    e.stopPropagation();
    setMemberAction((prev) => (prev === userId ? null : userId));
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
      setMemberAction(null);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <Accordion
      variant="splitted"
      itemClasses={{
        title: "text-xl",
        base: "-mt-2 ",
        content: "",
      }}
    >
      <AccordionItem key="1" aria-label="Members" title="Members">
        <ul className="flex flex-col gap-3  max-h-[270px] overflow-y-auto">
          {members.map((member) => (
            <li
              key={member.userId}
              className="flex items-center justify-between gap-3 group relative"
            >
              <div className="flex items-center gap-3">
                <img
                  src={member.imageUrl}
                  alt={member.name}
                  className="w-10 h-10 rounded-full object-cover border border-white"
                />
                <div className="flex flex-col">
                  <span className="font-medium">
                    {member.userId === currentUserId ? "Bạn" : member.name}
                  </span>
                  {member.role && (
                    <span className="text-sm text-gray-400">
                      {roleLabel[member.role as keyof typeof roleLabel]}
                    </span>
                  )}
                </div>
              </div>
              <div className="relative">
                {(member.userId === currentUserId ||
                  yourRole === "owner" ||
                  yourRole === "admin") && (
                  <button
                    onClick={(e) => handleActionClick(e, member.userId)}
                    className={`${
                      memberAction === member.userId
                        ? "group-hover:hidden"
                        : "group-hover:flex"
                    } bottom-0 w-8 h-8 rounded-full hover:bg-gray-200 hidden  items-center justify-center z-10`}
                  >
                    <span className="text-xs">●●●</span>
                  </button>
                )}

                {memberAction === member.userId && (
                  <div
                    ref={menuRef}
                    className="absolute bottom-0 z-[90] right-0  bg-white rounded shadow-lg w-48 text-black"
                  >
                    {member.userId === currentUserId ? (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            isConfirmation(true);
                            console.log("Leave Group clicked");
                          }}
                          className="block w-full text-left text-red-600 hover:bg-gray-100 px-4 py-2"
                        >
                          Leave Group
                        </button>
                      </>
                    ) : (
                      <>
                        {yourRole === "owner" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              requestObject({
                                operation: "/member/role",
                                object: {
                                  chatId: currentChat.ChatID,
                                  userId: currentUserId,
                                  memberToChangeId: member.userId,
                                  newRole: "admin"
                                }
                              })
                              isConfirmation(true);
                              console.log("Set Admin role clicked");
                            }}
                            className="block w-full text-left hover:bg-gray-100 px-4 py-2"
                          >
                            Promote to Admin
                          </button>
                        )}
                        {member.role !== "owner" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              requestObject({
                                operation: "/member/remove",
                                object: {
                                  chatId: currentChat.ChatID,
                                  userId: currentUserId,
                                  memberToRemoveId: member.userId
                                }
                              })
                              isConfirmation(true);
                              console.log("Remove From Group clicked");
                            }}
                            className="block w-full text-left text-red-600 hover:bg-gray-100 px-4 py-2"
                          >
                            Remove From Group
                          </button>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </AccordionItem>
    </Accordion>
  );
};

export default ListMembersGroupChat;
