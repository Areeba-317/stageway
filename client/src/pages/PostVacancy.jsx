import { useLocation, useNavigate } from 'react-router-dom'
import AppLayout from '../components/AppLayout'
import VacancyForm from '../components/VacancyForm'
import { createVacancy, updateVacancy } from '../services/api'

export default function PostVacancy() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const editing = state?.vacancy
  const id = editing?._id || editing?.id

  const handleSubmit = async (payload) => {
    if (editing) await updateVacancy(id, payload)
    else await createVacancy(payload)
    navigate('/director', {
      state: { saved: editing ? 'Vacancy updated.' : 'Vacancy posted.' },
    })
  }

  return (
    <AppLayout>
      <h1 style={{ fontSize: 36, marginBottom: 0 }}>
        {editing ? 'Edit casting call' : 'Post a casting call'}
      </h1>
      <p className="page-sub">Publish an audition call for actors across Urdu theatre and television.</p>
      <VacancyForm
        key={id || 'new'}
        initial={editing}
        submitLabel={editing ? 'Save changes' : 'Publish vacancy'}
        onSubmit={handleSubmit}
      />
    </AppLayout>
  )
}