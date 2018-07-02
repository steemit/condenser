import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';

import tt from 'counterpart';
import o2j from 'shared/clash/object2json';
import proxifyImageUrl from 'app/utils/ProxifyUrl';
import normalizeProfile from 'app/utils/NormalizeProfile';

import user from 'app/redux/User';
import transaction from 'app/redux/Transaction';

import Dropzone from 'react-dropzone';
import StyledButton from 'golos-ui/Button';
import Icon from 'golos-ui/Icon';
import Flex from './../Flex';
import StyledContainer from './../Container';
import UserProfileAvatar from './../UserProfileAvatar';
import Follow from './../Follow';

// TODO: import in styled component
const backgroundNone = `data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiCiAgICAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICAgICAgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiICBpZD0ic25hcHNob3QtNDUzMjMiIHdpZHRoPSIxMDAiIGhlaWdodD0iMjE1IiB2aWV3Qm94PSIwIDAgMTAwIDIxNSI+PGRlc2M+VGhpcyBpbWFnZSB3YXMgbWFkZSBvbiBQYXR0ZXJuaW5qYS5jb208L2Rlc2M+PGRlZnM+CjwhLS0gaW1hZ2UgNTMwNjUgLS0+CjxnIGlkPSJ0cmFuc2Zvcm1lZC01MzA2NSIgZGF0YS1pbWFnZT0iNTMwNjUiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDQxLjI2OTk5OTk5OTk5OTk5NiwgLTQzLjAxKSByb3RhdGUoMzU5LCA0OS41LCA1MykiPjxnPjxzdmcgdmVyc2lvbj0iMS4xIiB3aWR0aD0iOTlweCIgaGVpZ2h0PSIxMDZweCIgdmlld0JveD0iMCAwIDk5IDEwNiI+PGcgaWQ9Im9yaWdpbmFsLTUzMDY1Ij48c3ZnIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgdmlld0JveD0iMCAwIDQxIDQ0IiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJ4TWlkWU1pZCBtZWV0Ij4KICA8cGF0aCBkPSJNNi40NDUgMTcuNjI1YTEuMjQzIDEuMjQzIDAgMCAxLS4yODgtMi4zODdsMy4xNTMtMS4yNTJjLTEuNTM0LTEuNzY3LTIuMzI0LTMuNTQtMi4zMjQtNS4zMTlDNi45ODYgMy43OTEgMTAuNDY0IDAgMTUuMjM2IDBjNC44NDEgMCA4Ljc5IDMuODk1IDguNzY0IDguNjY3IDAgMy41MjUtMi4yMTIgNi43MDItNS40NjQgOC4wMy0yLjcxOCAxLjM3OC02Ljc0IDEuNjY4LTEyLjA5LjkyOHptMTEuMjE4LTIuNzI4bC4wODQtLjAzOEMyMC4yNzcgMTMuODQxIDIyIDExLjM3OCAyMiA4LjY2MiAyMi4wMiA1LjAwMiAxOC45NzcgMiAxNS4yMzcgMmMtMy42MjggMC02LjI1IDIuODU5LTYuMjUgNi42NjcgMCAxLjQ1OC44MTMgMy4wMzYgMi41MTEgNC43MzNhMS4yNDMgMS4yNDMgMCAwIDEtLjQyIDIuMDM1bC0xLjMxNS41MjNjMy40NzMuMjIxIDYuMTEtLjE0MiA3LjktMS4wNnoiIGZpbGwtcnVsZT0ibm9uemVybyIgZmlsbD0icmdiYSgyNDEsIDI0MSwgMjQxLCAxKSIgc3Ryb2tlPSJub25lIi8+CiAgPHBhdGggZD0iTTMyLjkwNCAyNS41MDdjMS41MDctLjEyIDIuODQ4LS4wMSA0IC4zODYgMy43MiAxLjI4MiA0LjUzIDQuMzcgMy45NDMgNy45NzQtLjEyMi43MTUtLjUxMiAxLjc2My0xLjE3NSAzLjJhMS40ODYgMS40ODYgMCAwIDEtMi44MzUtLjY0MmMuMDI3LTIuMTg1LS40My0zLjIyNy0xLjE4Ni0zLjQyNS0xLjE3OC0uMzEyLTIuNjgzLjA3LTQuODMzIDEuMi0xLjM4OC43MjgtNy4zNTYgNC40NDMtNy4xNDYgNC4zMTctLjI1Mi4xNTItLjQ5OS4yOTgtLjc0My40NC0uOTQ1LjU1NC0zLjc2NSAyLjI4MS00LjE1NiAyLjUxMy0xLjQ3OS44NzctMi41NzIgMS40MzYtMy42NiAxLjgzNi0xLjg4LjY5LTMuNjc1Ljg0OC01LjY5Ny40MzYtMy4wNi0uNjIzLTUuMTI4LTIuMzMyLTYuMDgyLTUuMDZhMS40ODYgMS40ODYgMCAwIDEgMi4wNzUtMS44MTZjLjI5OC4xNTEuNjY4LjI3MiAxLjEyOC4zNjIuNjIuMTMyIDEuMTg1LjIgMS43MzQuMiAzLjAzOCAwIDUuOTM4LTQuMTA3IDYuMzg3LTguMjAyLTIuNDM1LjMyNi00Ljk1LS4wMTQtNy41NTktMS41MjItMi42NTctMS41MzYtNC42NzMtMy42OTEtNi4wMy02LjQ0N2ExLjQ4NiAxLjQ4NiAwIDAgMSAxLjY1NC0yLjEwOWM0Ljk5NCAxLjEwOCA4LjYxOCAxLjY2IDEwLjgzNiAxLjY2IDcuMTQxIDAgMTMuMDY5LTUuNjUgMTMuMDY5LTEyLjk1MlY2LjUyMmExLjQ4NiAxLjQ4NiAwIDAgMSAyLjYxMS0uOTcxYzIuMDQ3IDIuMzcgMy4wNjYgNS40MSAzLjA2NiA5LjA3NyAwIDMuNTY0LS45ODIgNi44ODYtMi42MzYgOS45NjdhMjUuNzU2IDI1Ljc1NiAwIDAgMS0xLjAwOCAxLjcxN2MxLjU1NC0uNDI2IDIuOTMtLjcgNC4yNDMtLjgwNXptNS45NyA4LjAzMWMuNDQ3LTIuNzQ2LS4xMTQtNC44OS0yLjYyMi01Ljc1NC0uODU3LS4yOTUtMS45MzQtLjM4My0zLjE4OC0uMjgzLTEuMTcyLjA5NC0yLjQzLjM0NC0zLjc5Mi43MTctLjYxLjE2OC0uOTA3LjI1OS0xLjkwMy41NzMtLjMxMy4wOTgtLjQ3NC4xNDctLjYxNC4xODRhMi4yNDkgMi4yNDkgMCAwIDEtLjI4NC4wNmMtLjA5OC4wMTMtLjA5OC4wMTMtLjI3NC4wMDctLjI4LS4wMi0uMjgtLjAyLS43OS0uNTA0LS4yMTItLjM2Ni0uMTczLS42MjUtLjA1NC0uOTE0YTEuNCAxLjQgMCAwIDEgLjEwNy0uMjA3Yy4wNDctLjA3Ni4xMDQtLjE2LjE5LS4yOC0uMDAyLjAwMy40MDgtLjU1Ny41NjMtLjc3NWEyNC44MTIgMjQuODEyIDAgMCAwIDEuNjk0LTIuNzEyYzEuNTA4LTIuODExIDIuMzk4LTUuODIgMi4zOTgtOS4wMjIgMC0yLjU4Ny0uNTYxLTQuNzYyLTEuNjc5LTYuNTUtLjExOSA4LjMyMS02LjkxNSAxNC43My0xNS4wNjcgMTQuNzMtMi4yMjUgMC01LjYwNi0uNDktMTAuMTczLTEuNDY4IDEuMTUzIDEuOTQgMi43MiAzLjQ4IDQuNzE0IDQuNjMzIDIuMjkzIDEuMzI1IDQuNDggMS41NjkgNi42MTUgMS4yMjMtLjAwNS4wMDEuODc3LS4xNyAxLjA3Ny0uMTU2bC45MTYuMDY4LjAxLjkxOWMuMDU4IDUuNDItMy43NzYgMTEuNC04LjQ0NyAxMS40LS43IDAtMS40MDItLjA4NC0yLjEzMy0uMjRhNy43NzkgNy43NzkgMCAwIDEtLjQyOS0uMDk2Yy44MjEgMS40MTEgMi4xNjggMi4yOTYgNC4xMDYgMi42OTEgMS42NS4zMzYgMy4wNjguMjEyIDQuNjA4LS4zNTMuOTUxLS4zNSAxLjk0Ny0uODYgMy4zMy0xLjY4LjM3My0uMjIgMy4xOTktMS45NTEgNC4xNjYtMi41MTcuMjM3LS4xNC40NzgtLjI4Mi43MjQtLjQzLS4yNzMuMTY0IDUuNzgtMy42MDUgNy4yNDUtNC4zNzQgMi41NTQtMS4zNCA0LjQ5NC0xLjgzMyA2LjI3Mi0xLjM2MiAxLjM3My4zNiAyLjE4NyAxLjQ2NSAyLjUxMiAzLjE5OGE0LjkgNC45IDAgMCAwIC4yMDItLjcyNnoiIGZpbGwtcnVsZT0ibm9uemVybyIgZmlsbD0icmdiYSgyNDEsIDI0MSwgMjQxLCAxKSIgc3Ryb2tlPSJub25lIi8+CiAgPHBhdGggZD0iTTE1LjU0MiA1LjM0MWMtLjkwMSAwLTEuNzcuMzE5LTIuNTIxLjkwNGwtLjA5MS4wNTZjLS41MzQuMjU3LTEuMDM5LjIwOS0xLjMxMi0uMjYzLS4yNjEtLjQ1Mi0uMDg3LS45MTEuMzY3LTEuMjhDMTMuMDMgMy45NDYgMTQuMjYgMy41IDE1LjU0MiAzLjVjMS44MjEgMCAzLjU0Mi45MiA0Ljc1OSAyLjUwNS4yODQuNDguMjg0Ljk2NS0uMTExIDEuMjkzLS4zOTcuMzI5LS44NzMuMjQ0LTEuMjg5LS4xODUtLjg0NC0xLjExOC0yLjA2NC0xLjc3Mi0zLjM1OS0xLjc3MnptLTMuMDQ1LjA1OWMtLjEyLjA1Ny0uMDU2LjA2My0uMDEzLjEzNy4wMjcuMDQ4LjAxOS4wODIuMDkyLjAyOGwtLjA4LS4xNjV6IiBmaWxsLXJ1bGU9Im5vbnplcm8iIGZpbGw9InJnYmEoMjQxLCAyNDEsIDI0MSwgMSkiIHN0cm9rZT0ibm9uZSIvPgo8L3N2Zz4KPC9nPjwvc3ZnPjwvZz48L2c+CjwhLS0gL2ltYWdlIDUzMDY1IC0tPgoKPCEtLSBpbWFnZSA4MTMyOSAtLT4KPGcgaWQ9InRyYW5zZm9ybWVkLTgxMzI5IiBkYXRhLWltYWdlPSI4MTMyOSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTAuNjk4ODA3MjgxMTQzNzAwNywgNjQuNjg5MTM1MDU1OTE3NCkgcm90YXRlKDM1OSwgNDkuMzA4ODA3MjgxMTQzNywgNTIuODMwODY0OTQ0MDgyNTkpIj48Zz48c3ZnIHZlcnNpb249IjEuMSIgd2lkdGg9Ijk4LjYxNzYxNDU2MjI4NzRweCIgaGVpZ2h0PSIxMDUuNjYxNzI5ODg4MTY1MThweCIgdmlld0JveD0iMCAwIDk4LjYxNzYxNDU2MjI4NzQgMTA1LjY2MTcyOTg4ODE2NTE4Ij48ZyBpZD0ib3JpZ2luYWwtODEzMjkiPjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2aWV3Qm94PSIwIDAgNDEgNDQiIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjEiIHByZXNlcnZlQXNwZWN0UmF0aW89InhNaWRZTWlkIG1lZXQiPgogIDxwYXRoIGQ9Ik02LjQ0NSAxNy42MjVhMS4yNDMgMS4yNDMgMCAwIDEtLjI4OC0yLjM4N2wzLjE1My0xLjI1MmMtMS41MzQtMS43NjctMi4zMjQtMy41NC0yLjMyNC01LjMxOUM2Ljk4NiAzLjc5MSAxMC40NjQgMCAxNS4yMzYgMGM0Ljg0MSAwIDguNzkgMy44OTUgOC43NjQgOC42NjcgMCAzLjUyNS0yLjIxMiA2LjcwMi01LjQ2NCA4LjAzLTIuNzE4IDEuMzc4LTYuNzQgMS42NjgtMTIuMDkuOTI4em0xMS4yMTgtMi43MjhsLjA4NC0uMDM4QzIwLjI3NyAxMy44NDEgMjIgMTEuMzc4IDIyIDguNjYyIDIyLjAyIDUuMDAyIDE4Ljk3NyAyIDE1LjIzNyAyYy0zLjYyOCAwLTYuMjUgMi44NTktNi4yNSA2LjY2NyAwIDEuNDU4LjgxMyAzLjAzNiAyLjUxMSA0LjczM2ExLjI0MyAxLjI0MyAwIDAgMS0uNDIgMi4wMzVsLTEuMzE1LjUyM2MzLjQ3My4yMjEgNi4xMS0uMTQyIDcuOS0xLjA2eiIgZmlsbC1ydWxlPSJub256ZXJvIiBmaWxsPSJyZ2JhKDI0MSwgMjQxLCAyNDEsIDEpIiBzdHJva2U9Im5vbmUiLz4KICA8cGF0aCBkPSJNMzIuOTA0IDI1LjUwN2MxLjUwNy0uMTIgMi44NDgtLjAxIDQgLjM4NiAzLjcyIDEuMjgyIDQuNTMgNC4zNyAzLjk0MyA3Ljk3NC0uMTIyLjcxNS0uNTEyIDEuNzYzLTEuMTc1IDMuMmExLjQ4NiAxLjQ4NiAwIDAgMS0yLjgzNS0uNjQyYy4wMjctMi4xODUtLjQzLTMuMjI3LTEuMTg2LTMuNDI1LTEuMTc4LS4zMTItMi42ODMuMDctNC44MzMgMS4yLTEuMzg4LjcyOC03LjM1NiA0LjQ0My03LjE0NiA0LjMxNy0uMjUyLjE1Mi0uNDk5LjI5OC0uNzQzLjQ0LS45NDUuNTU0LTMuNzY1IDIuMjgxLTQuMTU2IDIuNTEzLTEuNDc5Ljg3Ny0yLjU3MiAxLjQzNi0zLjY2IDEuODM2LTEuODguNjktMy42NzUuODQ4LTUuNjk3LjQzNi0zLjA2LS42MjMtNS4xMjgtMi4zMzItNi4wODItNS4wNmExLjQ4NiAxLjQ4NiAwIDAgMSAyLjA3NS0xLjgxNmMuMjk4LjE1MS42NjguMjcyIDEuMTI4LjM2Mi42Mi4xMzIgMS4xODUuMiAxLjczNC4yIDMuMDM4IDAgNS45MzgtNC4xMDcgNi4zODctOC4yMDItMi40MzUuMzI2LTQuOTUtLjAxNC03LjU1OS0xLjUyMi0yLjY1Ny0xLjUzNi00LjY3My0zLjY5MS02LjAzLTYuNDQ3YTEuNDg2IDEuNDg2IDAgMCAxIDEuNjU0LTIuMTA5YzQuOTk0IDEuMTA4IDguNjE4IDEuNjYgMTAuODM2IDEuNjYgNy4xNDEgMCAxMy4wNjktNS42NSAxMy4wNjktMTIuOTUyVjYuNTIyYTEuNDg2IDEuNDg2IDAgMCAxIDIuNjExLS45NzFjMi4wNDcgMi4zNyAzLjA2NiA1LjQxIDMuMDY2IDkuMDc3IDAgMy41NjQtLjk4MiA2Ljg4Ni0yLjYzNiA5Ljk2N2EyNS43NTYgMjUuNzU2IDAgMCAxLTEuMDA4IDEuNzE3YzEuNTU0LS40MjYgMi45My0uNyA0LjI0My0uODA1em01Ljk3IDguMDMxYy40NDctMi43NDYtLjExNC00Ljg5LTIuNjIyLTUuNzU0LS44NTctLjI5NS0xLjkzNC0uMzgzLTMuMTg4LS4yODMtMS4xNzIuMDk0LTIuNDMuMzQ0LTMuNzkyLjcxNy0uNjEuMTY4LS45MDcuMjU5LTEuOTAzLjU3My0uMzEzLjA5OC0uNDc0LjE0Ny0uNjE0LjE4NGEyLjI0OSAyLjI0OSAwIDAgMS0uMjg0LjA2Yy0uMDk4LjAxMy0uMDk4LjAxMy0uMjc0LjAwNy0uMjgtLjAyLS4yOC0uMDItLjc5LS41MDQtLjIxMi0uMzY2LS4xNzMtLjYyNS0uMDU0LS45MTRhMS40IDEuNCAwIDAgMSAuMTA3LS4yMDdjLjA0Ny0uMDc2LjEwNC0uMTYuMTktLjI4LS4wMDIuMDAzLjQwOC0uNTU3LjU2My0uNzc1YTI0LjgxMiAyNC44MTIgMCAwIDAgMS42OTQtMi43MTJjMS41MDgtMi44MTEgMi4zOTgtNS44MiAyLjM5OC05LjAyMiAwLTIuNTg3LS41NjEtNC43NjItMS42NzktNi41NS0uMTE5IDguMzIxLTYuOTE1IDE0LjczLTE1LjA2NyAxNC43My0yLjIyNSAwLTUuNjA2LS40OS0xMC4xNzMtMS40NjggMS4xNTMgMS45NCAyLjcyIDMuNDggNC43MTQgNC42MzMgMi4yOTMgMS4zMjUgNC40OCAxLjU2OSA2LjYxNSAxLjIyMy0uMDA1LjAwMS44NzctLjE3IDEuMDc3LS4xNTZsLjkxNi4wNjguMDEuOTE5Yy4wNTggNS40Mi0zLjc3NiAxMS40LTguNDQ3IDExLjQtLjcgMC0xLjQwMi0uMDg0LTIuMTMzLS4yNGE3Ljc3OSA3Ljc3OSAwIDAgMS0uNDI5LS4wOTZjLjgyMSAxLjQxMSAyLjE2OCAyLjI5NiA0LjEwNiAyLjY5MSAxLjY1LjMzNiAzLjA2OC4yMTIgNC42MDgtLjM1My45NTEtLjM1IDEuOTQ3LS44NiAzLjMzLTEuNjguMzczLS4yMiAzLjE5OS0xLjk1MSA0LjE2Ni0yLjUxNy4yMzctLjE0LjQ3OC0uMjgyLjcyNC0uNDMtLjI3My4xNjQgNS43OC0zLjYwNSA3LjI0NS00LjM3NCAyLjU1NC0xLjM0IDQuNDk0LTEuODMzIDYuMjcyLTEuMzYyIDEuMzczLjM2IDIuMTg3IDEuNDY1IDIuNTEyIDMuMTk4YTQuOSA0LjkgMCAwIDAgLjIwMi0uNzI2eiIgZmlsbC1ydWxlPSJub256ZXJvIiBmaWxsPSJyZ2JhKDI0MSwgMjQxLCAyNDEsIDEpIiBzdHJva2U9Im5vbmUiLz4KICA8cGF0aCBkPSJNMTUuNTQyIDUuMzQxYy0uOTAxIDAtMS43Ny4zMTktMi41MjEuOTA0bC0uMDkxLjA1NmMtLjUzNC4yNTctMS4wMzkuMjA5LTEuMzEyLS4yNjMtLjI2MS0uNDUyLS4wODctLjkxMS4zNjctMS4yOEMxMy4wMyAzLjk0NiAxNC4yNiAzLjUgMTUuNTQyIDMuNWMxLjgyMSAwIDMuNTQyLjkyIDQuNzU5IDIuNTA1LjI4NC40OC4yODQuOTY1LS4xMTEgMS4yOTMtLjM5Ny4zMjktLjg3My4yNDQtMS4yODktLjE4NS0uODQ0LTEuMTE4LTIuMDY0LTEuNzcyLTMuMzU5LTEuNzcyem0tMy4wNDUuMDU5Yy0uMTIuMDU3LS4wNTYuMDYzLS4wMTMuMTM3LjAyNy4wNDguMDE5LjA4Mi4wOTIuMDI4bC0uMDgtLjE2NXoiIGZpbGwtcnVsZT0ibm9uemVybyIgZmlsbD0icmdiYSgyNDEsIDI0MSwgMjQxLCAxKSIgc3Ryb2tlPSJub25lIi8+Cjwvc3ZnPgo8L2c+PC9zdmc+PC9nPjwvZz4KPCEtLSAvaW1hZ2UgODEzMjkgLS0+CjwvZGVmcz48cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjIxNSIgZmlsbD0icmdiYSgyNDksIDI0OSwgMjQ5LCAxKSI+PC9yZWN0Pjx1c2UgeGxpbms6aHJlZj0iI3RyYW5zZm9ybWVkLTUzMDY1IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMTAwLCAtMjE1KSI+PC91c2U+PHVzZSB4bGluazpocmVmPSIjdHJhbnNmb3JtZWQtNTMwNjUiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDAsIC0yMTUpIj48L3VzZT48dXNlIHhsaW5rOmhyZWY9IiN0cmFuc2Zvcm1lZC01MzA2NSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTAwLCAtMjE1KSI+PC91c2U+PHVzZSB4bGluazpocmVmPSIjdHJhbnNmb3JtZWQtNTMwNjUiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0xMDAsIDApIj48L3VzZT48dXNlIHhsaW5rOmhyZWY9IiN0cmFuc2Zvcm1lZC01MzA2NSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMCwgMCkiPjwvdXNlPjx1c2UgeGxpbms6aHJlZj0iI3RyYW5zZm9ybWVkLTUzMDY1IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxMDAsIDApIj48L3VzZT48dXNlIHhsaW5rOmhyZWY9IiN0cmFuc2Zvcm1lZC01MzA2NSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTEwMCwgMjE1KSI+PC91c2U+PHVzZSB4bGluazpocmVmPSIjdHJhbnNmb3JtZWQtNTMwNjUiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDAsIDIxNSkiPjwvdXNlPjx1c2UgeGxpbms6aHJlZj0iI3RyYW5zZm9ybWVkLTUzMDY1IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxMDAsIDIxNSkiPjwvdXNlPjx1c2UgeGxpbms6aHJlZj0iI3RyYW5zZm9ybWVkLTgxMzI5IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMTAwLCAtMjE1KSI+PC91c2U+PHVzZSB4bGluazpocmVmPSIjdHJhbnNmb3JtZWQtODEzMjkiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDAsIC0yMTUpIj48L3VzZT48dXNlIHhsaW5rOmhyZWY9IiN0cmFuc2Zvcm1lZC04MTMyOSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTAwLCAtMjE1KSI+PC91c2U+PHVzZSB4bGluazpocmVmPSIjdHJhbnNmb3JtZWQtODEzMjkiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0xMDAsIDApIj48L3VzZT48dXNlIHhsaW5rOmhyZWY9IiN0cmFuc2Zvcm1lZC04MTMyOSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMCwgMCkiPjwvdXNlPjx1c2UgeGxpbms6aHJlZj0iI3RyYW5zZm9ybWVkLTgxMzI5IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxMDAsIDApIj48L3VzZT48dXNlIHhsaW5rOmhyZWY9IiN0cmFuc2Zvcm1lZC04MTMyOSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTEwMCwgMjE1KSI+PC91c2U+PHVzZSB4bGluazpocmVmPSIjdHJhbnNmb3JtZWQtODEzMjkiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDAsIDIxNSkiPjwvdXNlPjx1c2UgeGxpbms6aHJlZj0iI3RyYW5zZm9ybWVkLTgxMzI5IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxMDAsIDIxNSkiPjwvdXNlPjwvc3ZnPg==`;

// Styled Components
const Wrapper = styled.div`
    display: flex;
    align-items: center;
    min-height: 207px;

    ${({ backgroundUrl }) => backgroundUrl ? 
        `
        background-size: cover;
        background-repeat: no-repeat;
        background-position: 50% 50%;
        background-image: url(${backgroundUrl})
        ` 
        : 
        `
        background-size: 41px;
        background-repeat: repeat;
        background-position: 0px -26px;
        background-image: url(${backgroundNone})
        `
    }
`;

const Container = StyledContainer.extend`
    position: relative;

    @media (max-width: 768px) {
        flex-direction: column;
    }

    @media (max-width: 1200px) {
        margin-top: 23px;
        margin-bottom: 23px;
    }
`;

const Details = styled.div`
    margin-left: 28px;

    @media (max-width: 768px) {
        margin-top: 12px;
        margin-left: 0;
        text-align: center;
    }
`;

const Name = styled.div`
    color: #393636;
    font-family: 'Roboto Slab';
    font-size: 30px;
    font-weight: bold;
    line-height: 1;
    text-shadow: 0px 0px 1px #fff;

    @media (max-width: 768px) {
        font-size: 18px;
    }
`;

const Login = styled.div`
    color: #757575;
    font-family: 'Helvetica Neue';
    font-size: 20px;
    line-height: 1;
    margin-top: 6px;
    text-shadow: 0px 0px 1px rgba(255,255,255,0.4);

    @media (max-width: 768px) {
        font-size: 14px;
    }
`;

const Buttons = Flex.extend`
    margin-top: 24px;
`;

const Button = StyledButton.extend`
    width: 167px;
`;

const IconCover = styled(Dropzone)`
    position: absolute !important;
    top: 9px;
    right: 34px;

    cursor: pointer;
`;

// Component
class UserHeader extends Component {
    static propTypes = {
        account: PropTypes.object,

        uploadImage: PropTypes.func,
        updateAccount: PropTypes.func,
        notify: PropTypes.func,
    };

    dropzoneAvatar = null;
    dropzoneCover = null;

    uploadDropped = (acceptedFiles, rejectedFiles, key) => {
        const {
            account,
            profile,
            uploadImage,
            updateAccount,
            notify,
        } = this.props;

        if (rejectedFiles.length) {
            notify(tt('reply_editor.please_insert_only_image_files'), 10000);
        }

        if (!acceptedFiles.length) return;

        const file = acceptedFiles[0];
        uploadImage(file, ({ error, url }) => {
            if (error) {
                // show error notification
                notify(error, 10000);
                return;
            }

            if (url) {
                profile[key] = url;

                updateAccount({
                    json_metadata: JSON.stringify({ profile }),
                    account: account.name,
                    memo_key: account.memo_key,
                    errorCallback: e => {
                        if (e !== 'Canceled') {
                            notify(tt('g.server_returned_error'), 10000);
                            console.log('updateAccount ERROR', e);
                        }
                    },
                    successCallback: () => {
                        notify(tt('g.saved') + '!', 10000);
                    },
                });
            }
        });
    };

    handleDropAvatar = (acceptedFiles, rejectedFiles) => {
        this.uploadDropped(acceptedFiles, rejectedFiles, 'profile_image');
    };

    handleDropCover = (acceptedFiles, rejectedFiles) => {
        this.uploadDropped(acceptedFiles, rejectedFiles, 'cover_image');
    };

    render() {
        const { account, userName, isOwner, follow } = this.props;
        const {
            name,
            // gender,
            // location,
            // about,
            // website,
            profile_image,
            cover_image,
        } = normalizeProfile(account);

        // const website_label = website
        //     ? website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')
        //     : null;

        const backgroundUrl = cover_image
            ? proxifyImageUrl(cover_image, '0x0')
            : false;

        return (
            <Wrapper backgroundUrl={backgroundUrl}>
                <Container align="center">
                    <UserProfileAvatar avatarUrl={profile_image}>
                        {isOwner ? (
                            <Dropzone
                                ref={r => (this.dropzoneAvatar = r)}
                                onDrop={this.handleDropAvatar}
                                multiple={false}
                                accept="image/*"
                            />
                        ) : null}
                    </UserProfileAvatar>
                    <Details>
                        {name ? <Name>{name}</Name> : null}
                        <Login>@{account.name}</Login>
                        {!isOwner && (
                            <Buttons>
                                {/* <Button light>
                                <Icon name="reply" height="17px" width="18px" />Написать
                            </Button> */}
                                <Follow
                                    follower={userName}
                                    following={account.name}
                                />
                            </Buttons>
                        )}
                    </Details>
                    <IconCover
                        ref={r => (this.dropzoneCover = r)}
                        onDrop={this.handleDropCover}
                        multiple={false}
                        accept="image/*"
                    >
                        <Icon name="picture" size="20px" />
                    </IconCover>
                </Container>
            </Wrapper>
        );
    }
}

export default connect(
    // mapStateToProps
    (state, { account }) => {
        const current_user = state.user.get('current');
        const userName = current_user ? current_user.get('username') : '';

        let metaData = account
            ? o2j.ifStringParseJSON(account.json_metadata)
            : {};
        const profile = metaData && metaData.profile ? metaData.profile : {};

        return {
            account,
            userName,
            metaData,
            isOwner: userName == account.name,
            profile,
            follow: state.global.get('follow'),
        };
    },
    // mapDispatchToProps
    dispatch => ({
        uploadImage: (file, progress) => {
            dispatch({
                type: 'user/UPLOAD_IMAGE',
                payload: { file, progress },
            });
        },
        updateAccount: ({ successCallback, errorCallback, ...operation }) => {
            dispatch(
                transaction.actions.broadcastOperation({
                    type: 'account_metadata',
                    operation,
                    successCallback() {
                        dispatch(user.actions.getAccount());
                        successCallback();
                    },
                    errorCallback,
                })
            );
        },
        notify: (message, dismiss = 3000) => {
            dispatch({
                type: 'ADD_NOTIFICATION',
                payload: {
                    key: 'settings_' + Date.now(),
                    message,
                    dismissAfter: dismiss,
                },
            });
        },
    })
)(UserHeader);
