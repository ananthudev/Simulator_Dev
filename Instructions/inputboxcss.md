/_ Input Fields (text, number, date, time, select) _/
.input-field {
width: 100%;
padding: 9px 12px; /_ Adjusted padding _/
border: 1px solid #383838; /_ Adjusted border _/
border-radius: 5px; /_ Consistent radius _/
background: #080808; /_ Adjusted input background _/
color: #e0e0e0;
font-size: 13.5px; /_ Match base _/
transition: all 0.2s;
line-height: 1.5;
}

.input-field::placeholder {
color: #d4d4d4;
}

.input-field:focus {
border-color: #4a90e2;
background: #303030;
box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.15);
}

/_ Specific Input Type Styling _/
input[type="date"],
input[type="time"] {
min-height: 37px; /_ Match calculated input height _/
color-scheme: dark; /_ Improve date/time picker theme _/
}

/_ Select Dropdown Specifics _/
select.input-field {
cursor: pointer;
padding-right: 12px; /_ Ensure space for native arrow _/
}

select.input-field option {
background-color: #282828;
color: #e0e0e0;
padding: 8px 12px;
}
